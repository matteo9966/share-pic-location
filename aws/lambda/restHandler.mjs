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