const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/confusion-matrix', (req, res) => {
  const imagePath = path.join(__dirname, '../../ml-service/confusion_matrix.png');
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Confusion matrix not found' });
  }
});

router.get('/data-audit', (req, res) => {
  const imagePath = path.join(__dirname, '../../ml-service/data_audit.png');
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Data audit not found' });
  }
});

router.get('/classes', (req, res) => {
  const classesPath = path.join(__dirname, '../../ml-service/class_names.txt');
  
  if (fs.existsSync(classesPath)) {
    try {
      const classesContent = fs.readFileSync(classesPath, 'utf-8');
      const classes = classesContent.trim().split('\n').filter(c => c.length > 0);
      res.json({ classes });
    } catch (error) {
      res.status(500).json({ error: 'Error reading classes' });
    }
  } else {
    const defaultClasses = [
      'Ankle_boot', 'Bag', 'Coat', 'Dress', 'Pullover',
      'Sandal', 'Shirt', 'Sneaker', 'T-shirt', 'Trouser'
    ];
    res.json({ classes: defaultClasses });
  }
});

router.get('/metrics', (req, res) => {
  const metricsPath = path.join(__dirname, '../../ml-service/model_metrics.json');
  
  if (fs.existsSync(metricsPath)) {
    try {
      const metricsContent = fs.readFileSync(metricsPath, 'utf-8');
      const metrics = JSON.parse(metricsContent);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Error reading metrics' });
    }
  } else {
    res.status(404).json({ error: 'Metrics not found. Run training first.' });
  }
});

module.exports = router;

