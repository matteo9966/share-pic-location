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