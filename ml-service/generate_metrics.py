
import tensorflow as tf
from tensorflow.keras.utils import image_dataset_from_directory
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, precision_score, recall_score, f1_score
import os
import json

# Configuración
DATASET_PATH = '/Users/alvaromartin-pena/Desktop/fashion_dataset'
IMG_SIZE = 224
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'modelo_ropa.h5')
CLASS_NAMES_PATH = os.path.join(os.path.dirname(__file__), 'class_names.txt')

print("Loading model and data...")

if not os.path.exists(MODEL_PATH):
    print(f"Error: Model not found in {MODEL_PATH}")
    exit(1)

model = tf.keras.models.load_model(MODEL_PATH)
print(f"Model loaded from {MODEL_PATH}")

if os.path.exists(CLASS_NAMES_PATH):
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = [line.strip() for line in f.readlines() if line.strip()]
    print(f"Classes loaded: {class_names}")
else:
    class_names = [
        'Ankle_boot', 'Bag', 'Coat', 'Dress', 'Pullover',
        'Sandal', 'Shirt', 'Sneaker', 'T-shirt', 'Trouser'
    ]
    print(f"Using default classes: {class_names}")

# Cargar dataset de validación
val_df = image_dataset_from_directory(
    f'{DATASET_PATH}/val_df',
    image_size=(IMG_SIZE, IMG_SIZE),
    label_mode='int',
    shuffle=False
)

# Preprocesar datos
def limpiar_datos(img, label):
    img = tf.cast(img, tf.float32) / 255.0
    img = tf.image.resize(img, (IMG_SIZE, IMG_SIZE))
    return img, label

val_df_clean = val_df.map(limpiar_datos).prefetch(tf.data.AUTOTUNE)

print("Generating predictions...")

# Generar predicciones
y_true = []
y_pred = []

for images, labels in val_df_clean:
    preds = model.predict(images, verbose=0)
    y_true.extend(labels.numpy())
    y_pred.extend(np.argmax(preds, axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

print(f"Predictions generated: {len(y_true)} samples")

cm = confusion_matrix(y_true, y_pred)
print("Confusion matrix calculated")

# Calcular métricas
precision = precision_score(y_true, y_pred, average=None)
recall = recall_score(y_true, y_pred, average=None)
f1 = f1_score(y_true, y_pred, average=None)

# Calcular accuracy por clase
accuracy_per_class = cm.diagonal() / cm.sum(axis=1)

# Obtener reporte completo
report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)

# Guardar métricas en JSON
metrics_data = {
    'classes': class_names,
    'metrics': []
}

for i, class_name in enumerate(class_names):
    metrics_data['metrics'].append({
        'class': class_name,
        'precision': float(precision[i]),
        'recall': float(recall[i]),
        'f1_score': float(f1[i]),
        'accuracy': float(accuracy_per_class[i]),
        'support': int(cm.sum(axis=1)[i])
    })

# Guardar también métricas generales
metrics_data['overall'] = {
    'accuracy': float(report['accuracy']),
    'macro_avg_precision': float(report['macro avg']['precision']),
    'macro_avg_recall': float(report['macro avg']['recall']),
    'macro_avg_f1': float(report['macro avg']['f1-score']),
    'weighted_avg_precision': float(report['weighted avg']['precision']),
    'weighted_avg_recall': float(report['weighted avg']['recall']),
    'weighted_avg_f1': float(report['weighted avg']['f1-score'])
}

metrics_path = os.path.join(os.path.dirname(__file__), 'model_metrics.json')
with open(metrics_path, 'w') as f:
    json.dump(metrics_data, f, indent=2)

print(f"\nMetrics saved to: {metrics_path}")
print("\nMetrics summary:")
print(f"   Overall accuracy: {metrics_data['overall']['accuracy']:.2%}")
print(f"   Precision (macro): {metrics_data['overall']['macro_avg_precision']:.2%}")
print(f"   Recall (macro): {metrics_data['overall']['macro_avg_recall']:.2%}")
print(f"   F1-Score (macro): {metrics_data['overall']['macro_avg_f1']:.2%}")
print("\nReady! You can now view the metrics on the web.")

