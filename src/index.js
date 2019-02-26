const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

require('dotenv').config();

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(favicon(path.join(__dirname, '..', 'client', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'client')));

const s3 = new aws.S3();

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'abdalsamad-photos-store',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      const ext = file.originalname.split('.')[1];
      cb(null, `${Date.now().toString()}.${ext}`);
    },
  }),
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// 'avatar' is the name attrubute in the html form.
app.post('/', upload.array('avatar', 10), (req, res, next) => {
  res.send('successfully uploaded');
});

app.listen(app.get('port'), () => {
  // eslint-disable-next-line no-console
  console.log('App running on port', app.get('port'));
});
