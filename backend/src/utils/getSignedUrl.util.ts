import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "config/env.config";
import s3 from "config/s3.config";

export async function generateSignedUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: key
    })
    return getSignedUrl(s3, command, { expiresIn });
}