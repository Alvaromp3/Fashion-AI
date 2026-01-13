
import requests
import io
import base64
from PIL import Image
import numpy as np
import tensorflow as tf
from sklearn.cluster import KMeans
import json

# URLs de ejemplo para cada clase (puedes agregar más)
IMAGE_URLS = {
    'Ankle_boot': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800',
        'https://images.unsplash.com/photo-1608256246200-53bd35f37f47?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800',
        'https://images.unsplash.com/photo-1608256246200-53bd35f37f47?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800',
        'https://images.unsplash.com/photo-1608256246200-53bd35f37f47?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    'Bag': [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    ],
    'Coat': [
        'https://images.unsplash.com/photo-1539533018447-63fc4c3d7de4?w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1578662996442-221f1a717dd6?w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1578662996442-221f1a717dd6?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fc4c3d7de4?w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1578662996442-221f1a717dd6?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fc4c3d7de4?w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1578662996442-221f1a717dd6?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fc4c3d7de4?w=800',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        'https://images.unsplash.com/photo-1578662996442-221f1a717dd6?w=800',
        'https://images.unsplash.com/photo-1539533018447-63fc4c3d7de4?w=800',
    ],
    'Dress': [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
        'https://images.unsplash.com/photo-1566479179817-278a3c8a9c08?w=800',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
        'https://images.unsplash.com/photo-1566479179817-278a3c8a9c08?w=800',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
        'https://images.unsplash.com/photo-1566479179817-278a3c8a9c08?w=800',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
        'https://images.unsplash.com/photo-1566479179817-278a3c8a9c08?w=800',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
        'https://images.unsplash.com/photo-1566479179817-278a3c8a9c08?w=800',
    ],
    'Pullover': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    ],
    'Sandal': [
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
    ],
    'Shirt': [
        'https://images.unsplash.com/photo-1594938291221-94f313b0ee1c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1594938291221-94f313b0ee1c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1594938291221-94f313b0ee1c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1594938291221-94f313b0ee1c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        'https://images.unsplash.com/photo-1594938291221-94f313b0ee1c?w=800',
        'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
    ],
    'Sneaker': [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
    'T-shirt': [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    ],
    'Trouser': [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    ]
}

IMAGES_PER_CLASS = 15
MIN_CONFIDENCE = 0.7
IMG_SIZE = 224

MODEL_PATH = 'modelo_ropa.h5'
CLASS_NAMES_PATH = 'class_names.txt'

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

def preprocess_image(image):
    """Preprocesar imagen igual que en app.py"""
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    width, height = image.size
    
    if width < IMG_SIZE or height < IMG_SIZE:
        image = image.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    else:
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        image = image.crop((left, top, right, bottom))
        image = image.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    
    img_array = np.array(image)
    img_array = img_array.astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

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

def download_image(url):
    """Descargar imagen desde URL"""
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content))
        return image
    except Exception as e:
        print(f"Error descargando imagen {url}: {e}")
        return None

def classify_image(model, image):
    """Clasificar imagen usando el modelo"""
    try:
        img_array = preprocess_image(image)
        predictions = model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        return predicted_class_idx, confidence
    except Exception as e:
        print(f"Error clasificando imagen: {e}")
        return None, 0.0

def save_to_database(image_base64, clase_nombre, confianza, color, tipo):
    """Guardar prenda en la base de datos"""
    try:
        backend_url = 'http://localhost:5002'
        response = requests.post(
            f'{backend_url}/api/prendas/auto',
            json={
                'imagen_base64': image_base64,
                'clase_nombre': clase_nombre,
                'confianza': confianza,
                'color': color,
                'tipo': tipo
            },
            timeout=30
        )
        return response.status_code == 201
    except Exception as e:
        print(f"Error guardando en BD: {e}")
        return False

def main():
    print("🚀 Iniciando descarga y clasificación de imágenes...")
    
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model not found {MODEL_PATH}")
        return
    
    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"Error: {CLASS_NAMES_PATH} not found")
        return
    
    print(f"📦 Cargando modelo desde {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = [line.strip() for line in f.readlines()]
    
    print(f"Model loaded. Classes: {class_names}")
    
    total_added = 0
    total_processed = 0
    
    for clase_nombre in class_names:
        if clase_nombre not in IMAGE_URLS:
            continue
        
        print(f"\n📸 Procesando {clase_nombre}...")
        added = 0
        urls = IMAGE_URLS[clase_nombre][:IMAGES_PER_CLASS]
        
        for i, url in enumerate(urls, 1):
            print(f"  [{i}/{len(urls)}] Descargando {url[:50]}...")
            image = download_image(url)
            if image is None:
                continue
            
            total_processed += 1
            predicted_class_idx, confidence = classify_image(model, image)
            
            if predicted_class_idx is None:
                continue
            
            predicted_class = class_names[predicted_class_idx]
            
            if predicted_class == clase_nombre and confidence >= MIN_CONFIDENCE:
                color = detect_color(image)
                tipo = class_to_tipo[clase_nombre]
                
                buffered = io.BytesIO()
                image.save(buffered, format="JPEG")
                img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
                
                if save_to_database(img_base64, clase_nombre, confidence, color, tipo):
                    added += 1
                    total_added += 1
                    print(f"    Added: {clase_nombre} ({confidence:.2%}) - Color: {color}")
                else:
                    print(f"    Error saving to DB")
            else:
                print(f"    Rejected: Prediction={predicted_class} ({confidence:.2%}) - Expected={clase_nombre}")
        
        print(f"  {clase_nombre}: {added} images added")
    
    print(f"\nProcess completed!")
    print(f"   Total processed: {total_processed}")
    print(f"   Total added: {total_added}")

if __name__ == '__main__':
    import os
    main()
