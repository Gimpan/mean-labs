const multer = require('multer');

const pathToImages = process.env.BACKEND_IMAGES_PATH;

const MIME_TYPE_MAP = {
  'img/png': 'png',
  'img/jpeg': 'jpg',
  'img/jpg': 'jpg',
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if(isValid) {
      error= null;
    }
    cb(null, pathToImages);
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

module.exports = multer({storage: storage}).single('image');
