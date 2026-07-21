import { 
     DynamoDBDocumentClient, 
     PutCommand, 
     GetCommand, 
     UpdateCommand, 
     DeleteCommand 
   } from "@aws-sdk/lib-dynamodb";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";


   const ddbClient = new DynamoDBClient({ region: "eu-north-1" });
   const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
   const tablename = process.env.PICTURES_TABLE_NAME;


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
        const sub = userClaims ? userClaims['sub'] : 'anonymous';
        const email = userClaims ? userClaims['email'] : 'anonymous';
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
              const picturePayload = buildPictureItemPayload(userClaims, payload);
              result = await ddbDocClient.send(new PutCommand(picturePayload));
              return buildResponse(201, { message: "Item created successfully", picture_id: result.Item?.picture_id });



      
            // case 'GET': // Replaces 'read'
            //   // Note: For GET requests, parameters are often passed in event.queryStringParameters 
            //   // If your payload is mapped there, you'd adjust this setup accordingly.
            //   result = await ddbDocClient.send(new GetCommand(payload));
            //   return buildResponse(200, result.Item ? result.Item : { message: "Item not found" });
      
            // case 'PUT': // Replaces 'update'
            //   result = await ddbDocClient.send(new UpdateCommand(payload));
            //   return buildResponse(200, { message: "Item updated successfully", result });
      
            // case 'DELETE': // Replaces 'delete'
            //   result = await ddbDocClient.send(new DeleteCommand(payload));
            //   return buildResponse(200, { message: "Item deleted successfully", result });
      
            default:
              return buildResponse(405, { error: `HTTP Method ${httpMethod} not allowed.` });
          }
        } catch (error) {
          console.error("DynamoDB Execution Error:", error);
          // Check if error is from validation
          if (error.message && error.message.includes("is required") || error.message.includes("too large")) {
            return buildResponse(400, { error: error.message });
          }
          return buildResponse(500, { error: error.message });
        }
      };


      function buildPictureItemPayload(userClaims, pictureData) {
        // Validation
        if (!pictureData.s3_key) {
          throw new Error("s3_key is required");
        }
        if (!pictureData.location || typeof pictureData.location.latitude !== 'number' || typeof pictureData.location.longitude !== 'number') {
          throw new Error("location with valid latitude and longitude is required");
        }

        const userSub = userClaims?.sub || 'anonymous';
        const pictureId = randomUUID();

        const item = {
          sub: userSub, // Partition Key
          picture_id: pictureId, // Sort Key
          s3_key: pictureData.s3_key,
          location: {
            latitude: pictureData.location.latitude,
            longitude: pictureData.location.longitude
          },
          description: pictureData.description || "",
        //   createdAt: new Date().toISOString()
        };

        // Optional: Add base64 image data if provided (with size check for DynamoDB 400KB item limit)
        if (pictureData.imageData) {
          // Rough estimate: base64 encoded data is ~1.3x larger than binary
          if (pictureData.imageData.length > 300000) { // ~300KB of base64 = ~230KB binary
            throw new Error("Image data too large for DynamoDB storage. Use S3 for large files.");
          }
          item.imageData = pictureData.imageData;
        }

        return {
          TableName: tablename,
          Item: item
        };
      }