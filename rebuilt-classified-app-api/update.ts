import * as dynamoDbLib from "./libs/dynamodb-lib";
import {success, failure} from "./libs/response-lib";

export async function main(event, context, callback) {
    const data = JSON.parse(event.body);
    const params = {
        TableName: "rebuiltClassified",
        // 'Key' defines the partition key and sort key of the item to be updated
        // - 'userId': Identity Pool identity id of the authenticated user
        // - 'itemId': path parameter
        Key: {
            userId: "public",
            itemId: event.pathParameters.id
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: "SET content = :content, attachment = :attachment, price = :price, specifications = :specifications, title = :title, photo = :photo",
        ExpressionAttributeValues: {
            ":attachment": data.attachment ? data.attachment : null,
            ":content": data.content ? data.content : null,
            ":price": data.price ? data.price : null,
            ":photo": data.photo ? data.photo : null,
            ":specifications": data.specifications ? data.specifications : null,
            ":title": data.title ? data.title : null
        },
        ReturnValues: "ALL_NEW"
    };
    try {
        const result = await dynamoDbLib.call("update", params);
        callback(null, success({status: true}));
    } catch (e) {
        callback(null, failure({status: false}));
    }
}
