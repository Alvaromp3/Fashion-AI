from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'temp'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif'}
IMG_SIZE = 224

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = None
class_names = None
class_to_tipo = None
tipo_por_indice = None

def load_model():
    global model, class_names, class_to_tipo, tipo_por_indice
    
    model_path = os.path.join(os.path.dirname(__file__), 'modelo_ropa.h5')
    
    if os.path.exists(model_path):
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
    else:
        print(f"Model not found in {model_path}")
        print("Service will work with default values")
        model = None
    
    class_names = [
        'Ankle_boot',
        'Bag',
        'Coat',
        'Dress',
        'Pullover',
        'Sandal',
        'Shirt',
        'Sneaker',
        'T-shirt',
        'Trouser'
    ]
    
    print(f"\nModel classes ({len(class_names)} classes):")
    for i, nombre in enumerate(class_names):
        print(f"  {i}: {nombre}")
    print()
    
    class_to_tipo = {
        'Ankle_boot': 'zapatos',
        'Bag': 'accesorio',
        'Coat': 'abrigo',
        'Dress': 'vestido',
        'Pullover': 'superior',
        'Sandal': 'zapatos',
        'Shirt': 'superior',
        'Sneaker': 'zapatos',
        'T-shirt': 'superior',
        'Trouser': 'inferior'
    }
    
    tipo_por_indice = {
        0: 'zapatos',
        1: 'accesorio',
        2: 'abrigo',
        3: 'vestido',
        4: 'superior',
        5: 'zapatos',
        6: 'superior',
        7: 'zapatos',
        8: 'superior',
        9: 'inferior'
    }
    
    print("\nVerifying class mapping...")
    todas_mapeadas = True
    for i, clase in enumerate(class_names):
        if clase not in class_to_tipo:
            print(f"  WARNING: Class '{clase}' (index {i}) has no type mapping!")
            todas_mapeadas = False
        else:
            tipo_esperado = tipo_por_indice.get(i, 'desconocido')
            tipo_mapeado = class_to_tipo[clase]
            if tipo_mapeado == tipo_esperado:
                print(f"  {i}: {clase} -> {tipo_mapeado}")
            else:
                print(f"  {i}: {clase} -> {tipo_mapeado} (expected: {tipo_esperado})")
                todas_mapeadas = False
    
    if todas_mapeadas:
        print("  All mappings are correct\n")
    else:
        print("  There are problems with the mappings\n")

def preprocess_image(image):
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    width, height = image.size
    
    if width < IMG_SIZE or height < IMG_SIZE:
        if width < height:
            new_width = IMG_SIZE
            new_height = int(height * (IMG_SIZE / width))
        else:
            new_height = IMG_SIZE
            new_width = int(width * (IMG_SIZE / height))
        image = image.resize((new_width, new_height), Image.LANCZOS)
        width, height = image.size
    
    if width != IMG_SIZE or height != IMG_SIZE:
        left = (width - IMG_SIZE) / 2
        top = (height - IMG_SIZE) / 2
        right = (width + IMG_SIZE) / 2
        bottom = (height + IMG_SIZE) / 2
        image = image.crop((left, top, right, bottom))
    
    image = image.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    
    img_array = np.array(image)
    img_array = img_array.astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_color(image):
    try:
        img_array = np.array(image)
        
        img_small = Image.fromarray(img_array).resize((400, 400))
        img_array = np.array(img_small)
        
        if img_array.shape[2] == 4:
            alpha = img_array[:, :, 3]
            mask = alpha > 128
            img_array = img_array[mask][:, :3]
            if len(img_array) == 0:
                return 'desconocido'
        
        height, width = img_array.shape[:2]
        
        border_width = max(8, int(min(height, width) * 0.12))
        border_pixels = []
        
        border_pixels.extend(img_array[0:border_width, :].reshape(-1, 3))
        border_pixels.extend(img_array[-border_width:, :].reshape(-1, 3))
        border_pixels.extend(img_array[:, 0:border_width].reshape(-1, 3))
        border_pixels.extend(img_array[:, -border_width:].reshape(-1, 3))
        
        corner_size = border_width
        border_pixels.extend(img_array[0:corner_size, 0:corner_size].reshape(-1, 3))
        border_pixels.extend(img_array[0:corner_size, -corner_size:].reshape(-1, 3))
        border_pixels.extend(img_array[-corner_size:, 0:corner_size].reshape(-1, 3))
        border_pixels.extend(img_array[-corner_size:, -corner_size:].reshape(-1, 3))
        
        border_pixels = np.array(border_pixels)
        
        if len(border_pixels) > 0:
            border_rounded = (border_pixels / 15).astype(int) * 15
            unique_colors, counts = np.unique(border_rounded, axis=0, return_counts=True)
            top_bg_colors = unique_colors[np.argsort(counts)[-3:]]
            bg_color = top_bg_colors[-1].astype(float)
        else:
            bg_color = np.array([255.0, 255.0, 255.0])
        
        img_flat = img_array.reshape(-1, 3).astype(np.float32)
        
        distances = np.sqrt(np.sum((img_flat - bg_color) ** 2, axis=1))
        
        bg_brightness = np.mean(bg_color) / 255.0
        bg_saturation = (np.max(bg_color) - np.min(bg_color)) / (np.max(bg_color) + 1e-5)
        
        if bg_brightness > 0.85:
            threshold = 55
        elif bg_brightness < 0.2:
            threshold = 35
        else:
            threshold = 45
        
        if bg_saturation < 0.1:
            threshold += 5
        
        object_mask = distances > threshold
        
        center_y, center_x = height // 2, width // 2
        center_region_size = min(height, width) // 2.5
        center_mask = np.zeros((height, width), dtype=bool)
        y_start = max(0, center_y - center_region_size)
        y_end = min(height, center_y + center_region_size)
        x_start = max(0, center_x - center_region_size)
        x_end = min(width, center_x + center_region_size)
        center_mask[y_start:y_end, x_start:x_end] = True
        center_mask_flat = center_mask.reshape(-1)
        
        final_mask = object_mask & center_mask_flat
        
        if np.sum(final_mask) < 100:
            if np.sum(object_mask) < 100:
                pixels = img_flat
            else:
                pixels = img_flat[object_mask]
        else:
            pixels = img_flat[final_mask]
        
        if len(pixels) == 0:
            return 'desconocido'
        
        pixels = pixels.astype(np.float32)
        
        try:
            from sklearn.cluster import KMeans
            sample_size = min(3000, len(pixels))
            
            if sample_size < 30:
                r_avg = np.mean(pixels[:, 0])
                g_avg = np.mean(pixels[:, 1])
                b_avg = np.mean(pixels[:, 2])
            else:
                sample_indices = np.random.choice(len(pixels), sample_size, replace=False)
                sample_pixels = pixels[sample_indices]
                
                n_clusters = min(7, max(3, len(sample_pixels) // 40))
                
                kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=15, max_iter=300)
                kmeans.fit(sample_pixels)
                
                labels = kmeans.predict(pixels)
                cluster_counts = np.bincount(labels)
                
                sorted_clusters = np.argsort(cluster_counts)[::-1]
                dominant_cluster = sorted_clusters[0]
                dominant_color = kmeans.cluster_centers_[dominant_cluster]
                
                cluster_ratio = cluster_counts[dominant_cluster] / len(pixels)
                
                if cluster_ratio < 0.4 and len(sorted_clusters) > 1:
                    second_cluster = sorted_clusters[1]
                    second_color = kmeans.cluster_centers_[second_cluster]
                    second_ratio = cluster_counts[second_cluster] / len(pixels)
                    
                    if second_ratio > 0.25:
                        dominant_color = (dominant_color * cluster_ratio + second_color * second_ratio) / (cluster_ratio + second_ratio)
                
                r_avg, g_avg, b_avg = dominant_color[0], dominant_color[1], dominant_color[2]
        except:
            r_avg = np.mean(pixels[:, 0])
            g_avg = np.mean(pixels[:, 1])
            b_avg = np.mean(pixels[:, 2])
        
        max_channel = max(r_avg, g_avg, b_avg)
        min_channel = min(r_avg, g_avg, b_avg)
        delta = max_channel - min_channel
        
        brightness = max_channel / 255.0
        saturation = (delta / max_channel) if max_channel > 0 else 0
        
        if delta == 0:
            hue = 0
        elif max_channel == r_avg:
            hue = 60 * (((g_avg - b_avg) / delta) % 6)
        elif max_channel == g_avg:
            hue = 60 * (((b_avg - r_avg) / delta) + 2)
        else:
            hue = 60 * (((r_avg - g_avg) / delta) + 4)
        
        hue = hue / 360.0
        
        if brightness < 0.22:
            return 'negro'
        
        if saturation < 0.12 and brightness < 0.32:
            return 'negro'
        
        if brightness > 0.94 and saturation < 0.06:
            return 'blanco'
        
        if saturation < 0.1:
            if brightness < 0.35:
                return 'negro'
            elif brightness > 0.88:
                return 'blanco'
            else:
                return 'gris'
        
        if brightness < 0.28:
            return 'negro'
        
        if saturation > 0.28:
            if hue < 0.07 or hue > 0.93:
                if brightness > 0.55:
                    return 'rojo'
                else:
                    return 'rojo oscuro'
            
            elif 0.05 < hue < 0.12:
                if brightness > 0.48:
                    return 'naranja'
                else:
                    return 'naranja oscuro'
            
            elif 0.12 < hue < 0.20:
                if brightness > 0.48:
                    return 'amarillo'
                else:
                    return 'amarillo oscuro'
            
            elif 0.20 < hue < 0.48:
                if brightness > 0.48:
                    return 'verde'
                else:
                    return 'verde oscuro'
            
            elif 0.48 < hue < 0.56:
                if brightness > 0.48:
                    return 'cian'
                else:
                    return 'azul oscuro'
            
            elif 0.56 < hue < 0.72:
                if brightness > 0.48:
                    return 'azul'
                else:
                    return 'azul oscuro'
            
            elif 0.72 < hue < 0.93:
                if brightness > 0.68 and saturation > 0.32:
                    return 'rosa'
                elif brightness > 0.48:
                    return 'magenta'
                else:
                    return 'magenta oscuro'
        
        elif 0.10 < saturation < 0.38:
            if brightness < 0.38:
                return 'gris'
            elif 0.05 < hue < 0.12:
                return 'naranja claro'
            elif 0.12 < hue < 0.20:
                return 'amarillo claro'
            elif 0.20 < hue < 0.48:
                return 'verde claro'
            elif 0.48 < hue < 0.56:
                return 'azul claro'
            elif 0.72 < hue < 0.93 and brightness > 0.62:
                return 'rosa'
            else:
                return 'beige'
        
        if 0.05 < hue < 0.12 and saturation < 0.42 and brightness < 0.58:
            return 'marrón'
        
        if (0.05 < hue < 0.20) and brightness > 0.72 and saturation < 0.28:
            return 'beige'
        
        if saturation < 0.18:
            if brightness > 0.72:
                return 'beige'
            elif brightness < 0.38:
                return 'negro'
            else:
                return 'gris'
        
        if brightness < 0.32:
            return 'negro'
        
        channel_diff = max(abs(r_avg - g_avg), abs(r_avg - b_avg), abs(g_avg - b_avg))
        if channel_diff > 25:
            if r_avg > g_avg + 18 and r_avg > b_avg + 18:
                return 'rojo' if brightness > 0.48 else 'rojo oscuro'
            elif g_avg > r_avg + 18 and g_avg > b_avg + 18:
                return 'verde' if brightness > 0.48 else 'verde oscuro'
            elif b_avg > r_avg + 18 and b_avg > g_avg + 18:
                return 'azul' if brightness > 0.48 else 'azul oscuro'
        
        return 'multicolor'
        
    except Exception as e:
        print(f"Error in color detection: {e}")
        return 'desconocido'

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'model_loaded': model is not None
    })

@app.route('/classify', methods=['POST'])
def classify():
    try:
        if 'imagen' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['imagen']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        color = detect_color(image)
        
        top3_info = []
        
        if model is not None:
            img_array = preprocess_image(image)
            
            prediction = model.predict(img_array, verbose=0)
            clase = np.argmax(prediction[0])
            confianza = float(prediction[0][clase])
            
            top3_indices = np.argsort(prediction[0])[-3:][::-1]
            top3_predictions = [(class_names[i] if i < len(class_names) else f'clase_{i}', 
                                float(prediction[0][i])) 
                               for i in top3_indices]
            
            for idx in top3_indices:
                if idx < len(class_names):
                    top3_info.append({
                        'clase_nombre': class_names[idx],
                        'confianza': float(prediction[0][idx]),
                        'tipo': class_to_tipo.get(class_names[idx], tipo_por_indice.get(idx, 'desconocido'))
                    })
            
            sneaker_idx = class_names.index('Sneaker') if 'Sneaker' in class_names else -1
            pullover_idx = class_names.index('Pullover') if 'Pullover' in class_names else -1
            
            if sneaker_idx != -1 and pullover_idx != -1:
                sneaker_conf = float(prediction[0][sneaker_idx])
                pullover_conf = float(prediction[0][pullover_idx])
                
                if clase == pullover_idx and confianza < 0.6:
                    if sneaker_conf > 0.3 and (sneaker_conf > confianza * 0.7 or sneaker_conf > 0.4):
                        print(f"Adjustment: Pullover ({confianza:.2%}) vs Sneaker ({sneaker_conf:.2%})")
                        print(f"   Using Sneaker due to similar confidence and low Pullover confidence")
                        clase = sneaker_idx
                        clase_nombre = 'Sneaker'
                        confianza = sneaker_conf
                    elif sneaker_conf > confianza:
                        print(f"Adjustment: Sneaker ({sneaker_conf:.2%}) has higher confidence than Pullover ({confianza:.2%})")
                        clase = sneaker_idx
                        clase_nombre = 'Sneaker'
                        confianza = sneaker_conf
            
            if clase < len(class_names):
                clase_nombre = class_names[clase]
            else:
                clase_nombre = 'desconocido'
                print(f"Index {clase} out of range (max: {len(class_names)-1})")
            
            tipo = class_to_tipo.get(clase_nombre, None)
            
            if tipo is None:
                tipo = tipo_por_indice.get(clase, 'desconocido')
                print(f"Name mapping failed for '{clase_nombre}', using index {clase} -> {tipo}")
            else:
                tipo_por_idx = tipo_por_indice.get(clase, 'desconocido')
                if tipo != tipo_por_idx:
                    print(f"Inconsistency: name '{clase_nombre}' -> {tipo}, but index {clase} -> {tipo_por_idx}")
                    tipo = tipo_por_idx
            
            print(f"\nTop 3 Predictions:")
            for i, (nombre, prob) in enumerate(top3_predictions, 1):
                print(f"  {i}. {nombre}: {prob:.2%}")
            print(f"Final classification: {clase_nombre} (index {clase}) -> {tipo} (confidence: {confianza:.2%})\n")
        else:
            clase = 0
            confianza = 0.5
            clase_nombre = 'desconocido'
            tipo = 'superior'
        
        return jsonify({
            'clase': int(clase),
            'clase_nombre': clase_nombre,
            'tipo': tipo,
            'confianza': float(confianza),
            'color': color,
            'top3': top3_info
        })
    
    except Exception as e:
        print(f"Error in classification: {str(e)}")
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting ML service...")
    load_model()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

