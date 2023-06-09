import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";

export async function main(event, context, callback) {
    const params = {
        TableName: "rebuiltClassified",
        // 'Key' defines the partition key and sort key of the item to be removed
        // - 'userId': Identity Pool identity id of the authenticated user
        // - 'itemId': path parameter
        Key: {
            userId: "public",
            itemId: event.pathParameters.id
        }
    };
    try {
        const result = await dynamoDbLib.call("delete", params);
        callback(null, success({status: true}));
    } catch (e) {
        console.log(e);
        callback(null, failure({status: false}));
    }
}
