const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;
const DB   = path.join(__dirname, 'data', 'emergencias.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Leer el archivo JSON
function leerEmergencias() {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

// Guardar el archivo JSON
function guardarEmergencias(datos) {
  fs.writeFileSync(DB, JSON.stringify(datos, null, 2));
}

// GET — todos los marcadores (lo usan los visitantes)
app.get('/api/emergencias', (req, res) => {
  res.json(leerEmergencias());
});

// POST — añadir un marcador (solo tú desde el admin)
app.post('/api/emergencias', (req, res) => {
  const { tipo, lat, lng, descripcion } = req.body;
  if (!tipo || !lat || !lng) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const emergencias = leerEmergencias();
  const nueva = {
    id:          Date.now(),   // ID único basado en timestamp
    tipo,
    lat,
    lng,
    descripcion: descripcion || ''
  };

  emergencias.push(nueva);
  guardarEmergencias(emergencias);
  res.json(nueva);
});

// DELETE — eliminar un marcador por ID
app.delete('/api/emergencias/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const emergencias = leerEmergencias().filter(e => e.id !== id);
  guardarEmergencias(emergencias);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});