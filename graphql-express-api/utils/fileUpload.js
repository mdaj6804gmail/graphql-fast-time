const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const file_folder = path.join(__dirname, "../public/image/");
        if (!fs.existsSync(file_folder)) {
            fs.mkdirSync(file_folder);
        }
        return cb(null, file_folder);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "");
        const fullFileName = `${fileName}_${Date.now()}${fileExt}`;
        return cb(null, fullFileName);
    },
});

const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    if (!/\.(png|jpg|jpeg)/i.test(fileExt)) {
        return cb(null, false);
    }
    return cb(null, true);
};

module.exports = () =>
    multer({storage: Storage, fileFilter: fileFilter}).single("image");
