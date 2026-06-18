// Ejemplo de esquema Camiseta (simplificado)
const { Schema, model } = require('mongoose');
 
const CamisetaSchema = new Schema({
  torsoColor: String,
  mangaIzqColor: String,
  mangaDerColor: String,
  cuelloColor: String,
  fechaCreacion: { type: Date, default: Date.now },
  votos: [],       // (ver siguiente sección)
  calificacion: { type: Number, default: 0 }
});
const Camiseta = model('Camiseta', CamisetaSchema);
 
module.exports = Camiseta;