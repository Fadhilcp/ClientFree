import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.config";


if (!env.AWS_ACCESS_KEY) throw new Error("AWS_ACCESS_KEY_ID missing");
if (!env.AWS_SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY missing");

const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
    }
});

export default s3