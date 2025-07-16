const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/pdfs';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  const pdfDir = path.join(__dirname, 'public/pdfs');
  let files = [];

  if (fs.existsSync(pdfDir)) {
    files = fs.readdirSync(pdfDir).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }

  res.render('index', { files });
});

// Rota para upload
app.post('/upload', upload.single('pdfFile'), (req, res) => {
  res.redirect('/');
});

// Rota para download
app.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'public/pdfs', req.params.filename);
  res.download(file);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
