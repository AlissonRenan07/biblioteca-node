const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const uploadsJsonPath = path.join(__dirname, 'uploads.json');

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/pdfs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único baseado na data/hora
    const uniqueSuffix = Date.now();

    // Sanitiza o nome do arquivo:
    const sanitized = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .replace(/\s+/g, '-')            // espaços → hífens
      .replace(/[^a-zA-Z0-9\-_.]/g, ''); // remove outros símbolos

    const savedName = ${uniqueSuffix}-${sanitized};

    cb(null, savedName);
  }
});

const upload = multer({ storage });

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal
app.get('/', (req, res) => {
  let uploads = [];

  if (fs.existsSync(uploadsJsonPath)) {
    const raw = fs.readFileSync(uploadsJsonPath, 'utf8');
    uploads = JSON.parse(raw);
  }

  // Ordena alfabeticamente pelo nome original
  uploads.sort((a, b) =>
    a.originalName.localeCompare(b.originalName, undefined, { sensitivity: 'base' })
  );

  res.render('index', { uploads });
});

// Rota para upload
app.post('/upload', upload.single('pdfFile'), (req, res) => {
  const newUpload = {
    savedName: req.file.filename,
    originalName: req.file.originalname
  };

  let uploads = [];

  if (fs.existsSync(uploadsJsonPath)) {
    const raw = fs.readFileSync(uploadsJsonPath, 'utf8');
    uploads = JSON.parse(raw);
  }

  uploads.push(newUpload);

  fs.writeFileSync(uploadsJsonPath, JSON.stringify(uploads, null, 2));

  res.redirect('/');
});

// Rota para download
app.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'public/pdfs', req.params.filename);
  res.download(file);
});

app.listen(PORT, () => {
  console.log(Servidor rodando em http://localhost:${PORT});
});
