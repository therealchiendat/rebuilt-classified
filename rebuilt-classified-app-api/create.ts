import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
	// Request body is passed in as a JSON encoded string in 'event.body'
	const data =JSON.parse(event.body);
	const params = {
		TableName: "rebuiltClassified",
        // 'Item' contains the attributes of the item to be created
        // - 'userId': user identities are federated through the
        // Cognito Identity Pool, we will use the identity id
        // as the user id of the authenticated user
        // - 'itemId': a unique uuid
        // - 'content': parsed from request body
		// - 'type': item type
		// - 'price': item price
        // - 'attachment': parsed from request body
        // - 'createdAt': current Unix timestamp
		Item: {
			 userId: "public",
			 itemId: uuid.v1(),
			 title: data.title,
			 content: data.content,
			 type: data.type,
			 specifications: data.specifications,
			 price: data.price,
			 attachment: data.attachment,
			 photo: data.photo,
			 createdAt: Date.now()
		 }
	};

 try {
	 await dynamoDbLib.call("put", params);
	 callback(null, success(params.Item));

 } catch (e) {
 	console.error(e);
 	callback(null, failure({ status: false }));
 }
}
