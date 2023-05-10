import { Storage } from "aws-amplify";

/**
 * Uploads a file to S3 using the Amplify Storage API.
 * @param file - The file to be uploaded.
 * @returns A Promise that resolves with the S3 key of the uploaded file.
 */
export async function s3Upload(file: File): Promise<string> {
    // Generate a unique filename for the file
    const filename: string = `${Date.now()}-${file.name}`;

    // Upload the file to S3 using the Amplify Storage API
    const stored = await Storage.put(filename, file, {
        contentType: file.type,
    });

    // Return the S3 key of the uploaded file
    return stored.key;
}
