import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/s3.config";
import { env } from "../config/env.config";

if(!env.AWS_BUCKET) throw new Error("AWS_BUCKET missing");

const upload = multer({
    storage: multerS3({
        s3,
        bucket: env.AWS_BUCKET,
        acl: "private",
        metadata: (req, file, cb) => {
            cb(null, { filename: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    })
});

export default upload;