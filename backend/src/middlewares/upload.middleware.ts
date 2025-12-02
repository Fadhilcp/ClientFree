import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024,
    },
    fileFilter: (_, file, callback) => {
        if(!file.mimetype.startsWith('image/')) {
            return callback(new Error('Only image files are allowed!'));
        }
        callback(null, true);
    },
});