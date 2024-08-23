const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads'); // Specify the folder to store uploaded files
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Specify the file naming convention
    }
});

const upload = multer({ storage: storage });

module.exports = upload;