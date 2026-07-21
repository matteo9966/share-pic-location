# AWS Project  that uses cognito Identity pool so users can access S3 and store pictures on it 

- Add environment variables

VITE_AWS_REGION="ap-south-1"
VITE_COGNITO_USER_POOL_ID="ap-south-1_....."
VITE_COGNITO_USER_POOL_DOMAIN="https://ap-south-......auth.ap-south-1.amazoncognito.com"
VITE_COGNITO_USER_POOL_CLIENT_ID="......"
VITE_COGNITO_IDENTITY_POOL_ID="ap-south-1:......"
VITE_AWS_S3_BUCKET_NAME="....."



- Create the utils file and explain what is inside!

- Once created the login flow, i need to setup how i store pictures in s3.
- lets create an identity pool and associate it to the user pool

I have now created the identity pool



USER POLICIES:

User policy to access only his s3 bucket folder

This policy allows users only to interact with their bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowUserToListTheirOwnFolder",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::your-bucket-name"],
      "Condition": {
        "StringLike": {
          "s3:prefix": ["private/${cognito-identity.amazonaws.com:sub}/*"]
        }
      }
    },
    {
      "Sid": "AllowUserReadWriteAccessToTheirOwnFolder",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/private/${cognito-identity.amazonaws.com:sub}/*"
      ]
    }
  ]
}
```

This ${cognito-identity.amazonaws.com:sub} is the unique identity of the current logged in user




TO get a cognito token:

curl -X POST https://cognito-idp.<your-region>.amazonaws.com/ \
  -H 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
  -H 'Content-Type: application/x-amz-json-1.1' \
  -d '{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "<your-app-client-id>",
    "AuthParameters": {
      "USERNAME": "<user-email-or-username>",
      "PASSWORD": "<user-password>"
    }
  }'



  in my case:


curl -X POST https://cognito-idp.eu-north-1.amazonaws.com/ \
  -H 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
  -H 'Content-Type: application/x-amz-json-1.1' \
  -d '{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "",
    "AuthParameters": {
      "USERNAME": "",
      "PASSWORD": ""
    }
  }'



When using a LAMBDA and api gateway, enable PROXY-INTEGRATION!


```js
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  DeleteCommand 
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "eu-north-1" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const tablename = "lambda-apigateway";

// Helper function to format valid API Gateway Proxy responses
const buildResponse = (statusCode, data) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" // Handles CORS if needed
  },
  body: JSON.stringify(data)
});

export const handler = async (event, context) => {
  console.log("Incoming Event:", JSON.stringify(event));

  // 1. Safely extract Cognito user details if you need them in your DB operations
  const userClaims = event.requestContext?.authorizer?.claims;
  const username = userClaims ? userClaims['cognito:username'] : 'anonymous';

  // 2. Determine operation based on the HTTP Method routed by API Gateway
  const httpMethod = event.httpMethod;
  const path = event.path;

  // Handle special debug routes if your path matches them
  if (path.endsWith('/echo')) {
    return buildResponse(200, { message: "Echo routing success", eventBody: event.body });
  }
  if (path.endsWith('/get-event-info')) {
    return buildResponse(200, event);
  }

  // 3. Parse payload safely (API Gateway Proxy passes body as a stringified JSON)
  let payload = {};
  if (event.body) {
    try {
      payload = JSON.parse(event.body);
    } catch (err) {
      return buildResponse(400, { error: "Invalid JSON payload structure." });
    }
  }

  // Inject the database table name into the command payload parameters
  payload.TableName = tablename;

  try {
    let result;

    switch (httpMethod) {
      case 'POST': // Replaces 'create'
        result = await ddbDocClient.send(new PutCommand(payload));
        return buildResponse(201, { message: "Item created successfully", result });

      case 'GET': // Replaces 'read'
        // Note: For GET requests, parameters are often passed in event.queryStringParameters 
        // If your payload is mapped there, you'd adjust this setup accordingly.
        result = await ddbDocClient.send(new GetCommand(payload));
        return buildResponse(200, result.Item ? result.Item : { message: "Item not found" });

      case 'PUT': // Replaces 'update'
        result = await ddbDocClient.send(new UpdateCommand(payload));
        return buildResponse(200, { message: "Item updated successfully", result });

      case 'DELETE': // Replaces 'delete'
        result = await ddbDocClient.send(new DeleteCommand(payload));
        return buildResponse(200, { message: "Item deleted successfully", result });

      default:
        return buildResponse(405, { error: `HTTP Method ${httpMethod} not allowed.` });
    }
  } catch (error) {
    console.error("DynamoDB Execution Error:", error);
    return buildResponse(500, { error: error.message });
  }
};
```

{
    "resource": "/DynamoDBManager/get-event-info",
    "path": "/DynamoDBManager/get-event-info",
    "httpMethod": "GET",
    "headers": {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Authorization": "token",
        "Content-Type": "application/json",
        "Host": "9drj9c4vsb.execute-api.eu-north-1.amazonaws.com",
        "Postman-Token": "60a01f5f-1171-4fe7-aa37-41a5fc0248ca",
        "User-Agent": "PostmanRuntime/7.53.0",
        "X-Amzn-Trace-Id": "Root=1-6a5e4573-5cb5d88d4e6f34545f4ac5e3",
        "X-Forwarded-For": "151.26.94.116",
        "X-Forwarded-Port": "443",
        "X-Forwarded-Proto": "https"
    },
    "multiValueHeaders": {
        "Accept": [
            "*/*"
        ],
        "Accept-Encoding": [
            "gzip, deflate, br"
        ],
        "Authorization": [
            "token"
        ],
        "Content-Type": [
            "application/json"
        ],
        "Host": [
            "9drj9c4vsb.execute-api.eu-north-1.amazonaws.com"
        ],
        "Postman-Token": [
            "60a01f5f-1171-4fe7-aa37-41a5fc0248ca"
        ],
        "User-Agent": [
            "PostmanRuntime/7.53.0"
        ],
        "X-Amzn-Trace-Id": [
            "Root=1-6a5e4573-5cb5d88d4e6f34545f4ac5e3"
        ],
        "X-Forwarded-For": [
            "151.26.94.116"
        ],
        "X-Forwarded-Port": [
            "443"
        ],
        "X-Forwarded-Proto": [
            "https"
        ]
    },
    "queryStringParameters": null,
    "multiValueQueryStringParameters": null,
    "pathParameters": null,
    "stageVariables": null,
    "requestContext": {
        "resourceId": "sha8dn",
        "resourcePath": "/DynamoDBManager/get-event-info",
        "httpMethod": "GET",
        "extendedRequestId": "Az_KIEnSgi0EJ4Q=",
        "requestTime": "20/Jul/2026:15:57:39 +0000",
        "path": "/dev/DynamoDBManager/get-event-info",
        "accountId": "838254633746",
        "protocol": "HTTP/1.1",
        "stage": "dev",
        "domainPrefix": "9drj9c4vsb",
        "requestTimeEpoch": 1784563059534,
        "requestId": "c8431bc3-3e95-422c-8d66-787ef42d3c8a",
        "identity": {
            "cognitoIdentityPoolId": null,
            "accountId": null,
            "cognitoIdentityId": null,
            "caller": null,
            "sourceIp": "151.26.94.116",
            "principalOrgId": null,
            "accessKey": null,
            "cognitoAuthenticationType": null,
            "cognitoAuthenticationProvider": null,
            "userArn": null,
            "userAgent": "PostmanRuntime/7.53.0",
            "user": null
        },
        "domainName": "9drj9c4vsb.execute-api.eu-north-1.amazonaws.com",
        "deploymentId": "8e80c8",
        "apiId": "9drj9c4vsb"
    },
    "body": "{\"operation\": \"create\", \"payload\": {\"Item\": {\"id\": \"AAAAFGH\", \"number\": 15}}}",
    "isBase64Encoded": false
}


SO now lets create the lambda: 

- i need to use sub information to store the data and the pictures.
- each 


## USING SUB AS A DYNAMODB Partition key!

So i want to build this. A user uploads and shares pictures. React frontend, an api gateway. cognito identity pool for s3 so user can upload to s3, api gateway and a lambda so user can add description to the picture, the endpoints are authenticated, so they use cognito. Now? Should i use the requestContext.claims.sub and use this as a partition key in the dynamo db to associate the picture to the user?
Amazon Q
Retrieving knowledge

This response might contain information related to security, a nuanced topic. You should verify the response using informed human judgement. Visit Security in Amazon Q Developer  for more details.

Yes, using requestContext.claims.sub as a partition key in DynamoDB is absolutely the correct and recommended approach! This is a well-established best practice for user data association in AWS applications.

Why sub is the Right Choice
Immutable and Unique
The sub claim is a UUID that never changes for a user
Unlike cognito:username or email, which users can modify, sub remains constant
This prevents data inheritance issues where one user could access another's data
Security Best Practice
AWS documentation explicitly recommends using sub as the partition key
It follows the principle of least privilege
Enables row-level security in DynamoDB
Your Architecture Implementation
Here's how to structure your DynamoDB table for the picture sharing app:

Table Design
Table: UserPictures
Partition Key: user_id (String) = cognito sub claim
Sort Key: picture_id (String) = unique picture identifier

Sample Item Structure
{
  "user_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "picture_id": "pic_20240721_001",
  "s3_key": "users/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/pic_20240721_001.jpg",
  "description": "Beautiful sunset at the beach",
  "upload_timestamp": "2024-07-21T10:37:12Z",
  "file_size": 2048576,
  "content_type": "image/jpeg"
}

Lambda Function Implementation
Extracting the User ID
exports.handler = async (event) => {
    // Extract user ID from Cognito claims
    const userId = event.requestContext.authorizer.claims.sub;
    
    // Your business logic here
    const pictureData = {
        user_id: userId,
        picture_id: generatePictureId(),
        description: JSON.parse(event.body).description,
        // ... other fields
    };
    
    // Store in DynamoDB
    await dynamodb.putItem({
        TableName: 'UserPictures',
        Item: pictureData
    }).promise();
};

IAM Policy for Fine-Grained Access
You can create an IAM policy that restricts users to only access their own data:

{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/UserPictures",
            "Condition": {
                "ForAllValues:StringEquals": {
                    "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
                }
            }
        }
    ]
}

S3 Integration Pattern
For your S3 uploads with Cognito Identity Pool, structure your S3 keys to match:

s3://your-bucket/users/${cognito-identity.amazonaws.com:sub}/picture_id.jpg

This ensures each user can only upload to their own "folder" in S3.

Getting Started
Set up your DynamoDB table in the DynamoDB Console 
Configure your API Gateway with Cognito User Pool Authorizer 
Create your Lambda function to handle picture metadata
Set up Cognito Identity Pool for direct S3 uploads 
This pattern ensures secure, scalable user data isolation and is used by countless production applications on AWS. The sub claim becomes your reliable, immutable user identifier throughout your entire application stack.

