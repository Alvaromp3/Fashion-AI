const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  superior_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prenda',
    required: true
  },
  inferior_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prenda',
    required: true
  },
  zapatos_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prenda',
    required: true
  },
  puntuacion: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Outfit', outfitSchema);

