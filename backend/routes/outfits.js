const express = require('express');
const router = express.Router();
const Outfit = require('../models/Outfit');
const Prenda = require('../models/Prenda');

router.get('/recommend', async (req, res) => {
  try {
    const preferencias = {
      colores: req.query.colores ? JSON.parse(req.query.colores) : [],
      ocasion: req.query.ocasion || '',
      estilo: req.query.estilo || '',
      incluirVestido: req.query.incluirVestido === 'true'
    };

    const superiores = await Prenda.find({ tipo: 'superior' });
    const inferiores = await Prenda.find({ tipo: 'inferior' });
    const zapatos = await Prenda.find({ tipo: 'zapatos' });
    let vestidos = [];
    
    if (preferencias.incluirVestido) {
      vestidos = await Prenda.find({ tipo: 'vestido' });
    }

    if (superiores.length === 0 || inferiores.length === 0 || zapatos.length === 0) {
      return res.status(400).json({ 
        error: 'Not enough garments to generate outfits. You need at least 1 top, 1 bottom and 1 shoe.' 
      });
    }

    const outfits = [];
    const numRecomendaciones = 3;

    const combinacionesUsadas = new Set();
    
    const superioresTshirt = superiores.filter(p => p.clase_nombre === 'T-shirt');
    const superioresPullover = superiores.filter(p => p.clase_nombre === 'Pullover');
    const inferioresTrouser = inferiores.filter(p => p.clase_nombre === 'Trouser');
    const zapatosSneaker = zapatos.filter(p => p.clase_nombre === 'Sneaker');

    if (superioresTshirt.length === 0 && superioresPullover.length === 0) {
      return res.status(400).json({ 
        error: 'No T-shirt or Pullover available. You need at least one of these top garment types.' 
      });
    }

    if (inferioresTrouser.length === 0) {
      return res.status(400).json({ 
        error: 'No pants (Trouser) available.' 
      });
    }

    if (zapatosSneaker.length === 0) {
      return res.status(400).json({ 
        error: 'No sneakers (Sneaker) available.' 
      });
    }
    
    let tshirtUsado = false;
    let pulloverUsado = false;
    
    for (let i = 0; i < 50; i++) {
      if (outfits.length >= 10) break;

      let superior;
      if (superioresTshirt.length > 0 && superioresPullover.length > 0) {
        if (!tshirtUsado && i < 2) {
          superior = superioresTshirt[Math.floor(Math.random() * superioresTshirt.length)];
          tshirtUsado = true;
        } else if (!pulloverUsado && i < 2) {
          superior = superioresPullover[Math.floor(Math.random() * superioresPullover.length)];
          pulloverUsado = true;
        } else {
          const rand = Math.random();
          superior = rand < 0.5 && superioresTshirt.length > 0
            ? superioresTshirt[Math.floor(Math.random() * superioresTshirt.length)]
            : superioresPullover[Math.floor(Math.random() * superioresPullover.length)];
        }
      } else if (superioresTshirt.length > 0) {
        superior = superioresTshirt[Math.floor(Math.random() * superioresTshirt.length)];
      } else if (superioresPullover.length > 0) {
        superior = superioresPullover[Math.floor(Math.random() * superioresPullover.length)];
      } else {
        continue;
      }

      const inferior = inferioresTrouser[Math.floor(Math.random() * inferioresTrouser.length)];
      const zapato = zapatosSneaker[Math.floor(Math.random() * zapatosSneaker.length)];

      const comboKey = `${superior._id}-${inferior._id}-${zapato._id}`;
      if (combinacionesUsadas.has(comboKey)) continue;
      combinacionesUsadas.add(comboKey);

      let puntuacion = 20;
      const explicaciones = [];

      if (preferencias.colores.length > 0) {
        const coloresOutfit = [superior.color, inferior.color, zapato.color].map(c => c.toLowerCase());
        const tieneColorPreferido = preferencias.colores.some(colorPref => 
          coloresOutfit.some(color => color.includes(colorPref.toLowerCase()) || colorPref.toLowerCase().includes(color))
        );
        if (tieneColorPreferido) {
          puntuacion += 25;
          explicaciones.push(`Includes your preferred colors`);
        }
      }
      const coloresCompatibles = [
        ['negro', 'blanco', 'gris'],
        ['azul', 'blanco', 'negro'],
        ['rojo', 'negro', 'blanco'],
        ['verde', 'blanco', 'beige'],
        ['beige', 'blanco', 'marrón'],
        ['gris', 'negro', 'blanco'],
        ['azul', 'gris', 'blanco']
      ];

      const colores = [superior.color, inferior.color, zapato.color].map(c => c.toLowerCase());
      const esCompatible = coloresCompatibles.some(combo => 
        colores.every(color => combo.includes(color) || color === 'desconocido')
      );

      if (esCompatible) {
        puntuacion += 30;
        explicaciones.push(`Colors that match perfectly`);
      }

      if (preferencias.ocasion) {
        let adecuadoOcasion = false;
        switch(preferencias.ocasion) {
          case 'formal':
            if (superior.clase_nombre === 'Shirt' || superior.clase_nombre === 'Coat' || superior.clase_nombre === 'Dress') {
              puntuacion += 25;
              adecuadoOcasion = true;
            }
            break;
          case 'deportivo':
            if (superior.clase_nombre === 'T-shirt' || zapato.clase_nombre === 'Sneaker') {
              puntuacion += 25;
              adecuadoOcasion = true;
            }
            break;
          case 'casual':
            if (superior.clase_nombre === 'T-shirt' || superior.clase_nombre === 'Pullover') {
              puntuacion += 20;
              adecuadoOcasion = true;
            }
            break;
          case 'fiesta':
            if (superior.clase_nombre === 'Dress' || (superior.color !== 'negro' && superior.color !== 'gris')) {
              puntuacion += 25;
              adecuadoOcasion = true;
            }
            break;
          case 'trabajo':
            if (superior.clase_nombre === 'Shirt' || superior.clase_nombre === 'Coat') {
              puntuacion += 25;
              adecuadoOcasion = true;
            }
            break;
        }
        if (adecuadoOcasion) {
          explicaciones.push(`Perfect for ${preferencias.ocasion} occasion`);
        }
      }

      if (preferencias.estilo) {
        switch(preferencias.estilo) {
          case 'minimalista':
            if (['negro', 'blanco', 'gris', 'beige'].includes(superior.color.toLowerCase()) &&
                ['negro', 'blanco', 'gris', 'beige'].includes(inferior.color.toLowerCase())) {
              puntuacion += 20;
              explicaciones.push(`Minimalist and elegant style`);
            }
            break;
          case 'colorido':
            if (!['negro', 'blanco', 'gris'].includes(superior.color.toLowerCase()) ||
                !['negro', 'blanco', 'gris'].includes(inferior.color.toLowerCase())) {
              puntuacion += 20;
              explicaciones.push(`Colorful and vibrant look`);
            }
            break;
          case 'elegante':
            if (superior.clase_nombre === 'Coat' || superior.clase_nombre === 'Dress' || 
                zapato.clase_nombre === 'Ankle_boot') {
              puntuacion += 20;
              explicaciones.push(`Elegant and sophisticated combination`);
            }
            break;
          case 'moderno':
            if (superior.clase_nombre === 'T-shirt' || zapato.clase_nombre === 'Sneaker') {
              puntuacion += 20;
              explicaciones.push(`Modern and current look`);
            }
            break;
        }
      }

      if (superior.tipo && inferior.tipo && zapato.tipo) {
        puntuacion += 10;
      }

      if (puntuacion >= 70) {
        explicaciones.push(`High harmony score`);
      }

      if (explicaciones.length === 0) {
        explicaciones.push(`Classic and versatile combination`);
      }

      outfits.push({
        superior,
        inferior,
        zapatos: zapato,
        puntuacion: Math.min(100, puntuacion),
        explicaciones
      });
    }

    outfits.sort((a, b) => b.puntuacion - a.puntuacion);
    
    const mejoresOutfits = outfits.slice(0, 3);

    res.json(mejoresOutfits);
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
      res.status(500).json({ error: 'Error generating recommendations' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { superior_id, inferior_id, zapatos_id, puntuacion } = req.body;

    const superior = await Prenda.findById(superior_id);
    const inferior = await Prenda.findById(inferior_id);
    const zapatos = await Prenda.findById(zapatos_id);

    if (!superior || !inferior || !zapatos) {
      return res.status(404).json({ error: 'One or more garments not found' });
    }

    const outfit = new Outfit({
      superior_id,
      inferior_id,
      zapatos_id,
      puntuacion: puntuacion || 50
    });

    await outfit.save();
    
    await outfit.populate(['superior_id', 'inferior_id', 'zapatos_id']);
    
    res.status(201).json(outfit);
  } catch (error) {
    console.error('Error guardando outfit:', error);
      res.status(500).json({ error: 'Error saving the outfit' });
  }
});

router.get('/', async (req, res) => {
  try {
    const outfits = await Outfit.find()
      .populate('superior_id')
      .populate('inferior_id')
      .populate('zapatos_id')
      .sort({ fecha_creacion: -1 });
    res.json(outfits);
  } catch (error) {
    console.error('Error obteniendo outfits:', error);
      res.status(500).json({ error: 'Error getting outfits' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const outfit = await Outfit.findByIdAndDelete(req.params.id);
    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error('Error eliminando outfit:', error);
      res.status(500).json({ error: 'Error deleting the outfit' });
  }
});

module.exports = router;

