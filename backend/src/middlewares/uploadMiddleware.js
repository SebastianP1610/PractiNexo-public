const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination(_req, file, cb) {
    const dest =
      file.fieldname === 'foto'
        ? path.join(UPLOADS_DIR, 'fotos')
        : path.join(UPLOADS_DIR, 'cvs');
    try {
      fs.mkdirSync(dest, { recursive: true });
    } catch (err) {
      return cb(err);
    }
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

function fileFilterFoto(_req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, GIF)'));
  }
}

function fileFilterCV(_req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
}

const uploadFoto = multer({
  storage,
  fileFilter: fileFilterFoto,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadCV = multer({
  storage,
  fileFilter: fileFilterCV,
  limits: { fileSize: 5 * 1024 * 1024 },
});

function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        mensaje: 'El archivo excede el tamaño máximo permitido',
        error: err.message,
      });
    }
    return res.status(400).json({
      mensaje: 'Error al procesar el archivo',
      error: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      mensaje: err.message,
      error: err.message,
    });
  }
  next();
}

module.exports = {
  uploadFoto,
  uploadCV,
  handleMulterError,
};
