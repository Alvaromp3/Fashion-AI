const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'classify-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif|bmp|tiff|tif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'image/heic' || 
                     file.mimetype === 'image/heif' ||
                     file.mimetype === 'image/x-heic' ||
                     file.mimetype === 'image/x-heif';
    
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Image format not supported. Use: jpeg, jpg, png, gif, webp, heic, heif, bmp, tiff'));
    }
  }
});

router.post('/', upload.single('imagen'), async (req, res) => {
  let convertedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    let filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const isHeic = fileExt === '.heic' || fileExt === '.heif' || 
                   req.file.mimetype === 'image/heic' || 
                   req.file.mimetype === 'image/heif' ||
                   req.file.mimetype === 'image/x-heic' ||
                   req.file.mimetype === 'image/x-heif';
    
    if (isHeic) {
      try {
        convertedFilePath = path.join(path.dirname(filePath), `converted-${Date.now()}.jpg`);
        await sharp(filePath)
          .jpeg({ quality: 90 })
          .toFile(convertedFilePath);
        filePath = convertedFilePath;
        console.log('HEIC image converted to JPEG');
      } catch (conversionError) {
        console.error('Error converting HEIC:', conversionError);
      }
    }
    
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('imagen', fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: 'image/jpeg'
    });

    try {
      const response = await axios.post(`${mlServiceUrl}/classify`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      });

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      if (convertedFilePath && fs.existsSync(convertedFilePath)) {
        fs.unlinkSync(convertedFilePath);
      }

      const clase = response.data.clase || 0;
      const confianza = response.data.confianza || 0.5;
      const tipo = response.data.tipo || 'desconocido';
      const color = response.data.color || 'desconocido';

      res.json({
        tipo,
        color,
        confianza,
        clase,
        clase_nombre: response.data.clase_nombre || 'desconocido'
      });
    } catch (mlError) {
      console.error('Error calling ML service:', mlError.message);
      
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      if (convertedFilePath && fs.existsSync(convertedFilePath)) {
        fs.unlinkSync(convertedFilePath);
      }

      res.json({
        tipo: 'superior',
        color: 'desconocido',
        confianza: 0.5,
        clase: 0,
        clase_nombre: 'desconocido',
        warning: 'ML service not available, using default values'
      });
    }
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).json({ error: 'Error classifying the image' });
  }
});

module.exports = router;

