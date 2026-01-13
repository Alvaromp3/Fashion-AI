import tensorflow as tf
from tensorflow.keras.utils import image_dataset_from_directory
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report, precision_score, recall_score, f1_score
import os
import json

DATASET_PATH = '/Users/alvaromartin-pena/Desktop/fashion_dataset'
IMG_SIZE = 224
EPOCHS = 20

print("Loading datasets...")
train_df = image_dataset_from_directory(
    f'{DATASET_PATH}/train_df',
    image_size=(IMG_SIZE, IMG_SIZE),
    label_mode='int',
)

test_df = image_dataset_from_directory(
    f'{DATASET_PATH}/test_df',
    image_size=(IMG_SIZE, IMG_SIZE),
    label_mode='int',
)

val_df = image_dataset_from_directory(
    f'{DATASET_PATH}/val_df',
    image_size=(IMG_SIZE, IMG_SIZE),
    label_mode='int',
)

class_names = train_df.class_names
print('\nDataset classes:\n')
for i, name in enumerate(class_names):
    print(f'  {i}: {name}')
print()

for img, label in train_df.take(1):
    print(f'Image shape: {img.shape}')
    print(f'Label shape: {label.shape}\n')

def data_audit(dataset, class_name, n_images=9):
    plt.figure(figsize=(12, 12))
    plt.suptitle("Data Audit · Fashion Dataset", fontsize=18, fontweight="bold")

    for images, labels in dataset.take(1):
        for i in range(min(n_images, len(images))):
            ax = plt.subplot(3, 3, i + 1)
            plt.imshow(images[i].numpy().astype("uint8"))
            plt.title(class_name[labels[i]], fontsize=12)
            plt.axis("off")
            for spine in ax.spines.values():
                spine.set_visible(False)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig('data_audit.png', dpi=150, bbox_inches='tight')
    print("Data audit saved to: data_audit.png")
    plt.close()

print("Generating data audit...")
data_audit(train_df, class_names)

def limpiar_datos(img, label):
    img = tf.cast(img, tf.float32) / 255.0
    img = tf.image.resize(img, (IMG_SIZE, IMG_SIZE))
    return img, label

data_augment = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.15),
    tf.keras.layers.RandomZoom(0.15),
    tf.keras.layers.RandomContrast(0.15),
])

def entrenar_cnn_clasificacion_desde_cero(train_df, test_df, val_df, epochs=30):
    train_df_clean = train_df.map(limpiar_datos).map(lambda x, y: (data_augment(x), y)).shuffle(2000)
    test_df_clean = test_df.map(limpiar_datos)
    val_df_clean = val_df.map(limpiar_datos)

    train_df_clean = train_df_clean.prefetch(tf.data.AUTOTUNE)
    test_df_clean = test_df_clean.prefetch(tf.data.AUTOTUNE)
    val_df_clean = val_df_clean.prefetch(tf.data.AUTOTUNE)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        
        # Primera capa - detectar bordes
        tf.keras.layers.Conv2D(32, (3, 3), padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(0.2),
        
        tf.keras.layers.Conv2D(64, (3, 3), padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(0.2),
        
        tf.keras.layers.Conv2D(64, (3, 3), padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(0.2),
        
        # Segunda capa - detectar formas
        tf.keras.layers.Conv2D(128, (3, 3), padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(0.2),
        
        tf.keras.layers.Conv2D(128, (3, 3), padding='same'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.MaxPooling2D((2, 2)),
        tf.keras.layers.Dropout(0.2),
        
        # Tercera capa - decisión final
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(256),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Activation('relu'),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(len(class_names), activation='softmax')
    ])

    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    print("🚀 Iniciando entrenamiento...")
    history = model.fit(
        train_df_clean,
        validation_data=val_df_clean,
        epochs=epochs,
        callbacks=[early_stopping]
    )

    return model, history, train_df_clean, test_df_clean, val_df_clean

# Entrenar modelo
print("🎯 Iniciando entrenamiento...")
print(f"📊 Épocas: {EPOCHS}")
print(f"📊 Clases: {len(class_names)}")
print()

model, history, train_df_clean, test_df_clean, val_df_clean = entrenar_cnn_clasificacion_desde_cero(
    train_df, test_df, val_df, epochs=EPOCHS
)

# Guardar modelo
model_path = os.path.join(os.path.dirname(__file__), 'modelo_ropa.h5')
model.save(model_path)
print(f"Model saved to: {model_path}")

# Guardar nombres de clases
with open(os.path.join(os.path.dirname(__file__), 'class_names.txt'), 'w') as f:
    f.write('\n'.join(class_names))
print(f"Class names saved: {class_names}")

# Generar gráficas
print("📊 Generando gráficas...")

# Curva de accuracy
plt.figure(figsize=(8, 5))
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Accuracy · Train vs Validation')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)
plt.savefig('accuracy_curve.png')
print("Accuracy graph saved")

# Curva de loss
plt.figure(figsize=(8, 5))
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Loss · Train vs Validation')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)
plt.savefig('loss_curve.png')
print("Loss graph saved")

# Matriz de confusión
y_true = []
y_pred = []

for images, labels in val_df_clean:
    preds = model.predict(images, verbose=0)
    y_true.extend(labels.numpy())
    y_pred.extend(np.argmax(preds, axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(8, 8))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
disp.plot(cmap='Blues', values_format='d')
plt.title("Confusion Matrix · Validation")
plt.savefig('confusion_matrix.png')
print("Confusion matrix saved")

# Reporte de clasificación
print("\n📋 Reporte de Clasificación:")
report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
print(classification_report(y_true, y_pred, target_names=class_names))

# Calcular métricas por clase
precision = precision_score(y_true, y_pred, average=None)
recall = recall_score(y_true, y_pred, average=None)
f1 = f1_score(y_true, y_pred, average=None)

# Calcular accuracy por clase (diagonal de la matriz / total de esa clase)
accuracy_per_class = cm.diagonal() / cm.sum(axis=1)

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
print(f"Metrics saved to: {metrics_path}")

# Resumen final
print("\n" + "="*60)
print("TRAINING COMPLETED!")
print("="*60)
print(f"📦 Modelo guardado en: {model_path}")
print(f"📊 Tamaño del modelo: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
print(f"📋 Clases: {class_names}")
print("="*60)
