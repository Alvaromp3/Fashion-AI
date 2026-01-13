# 👕 Fashion AI - Recomendador de Outfits

Aplicación web para subir fotos de ropa, clasificarlas automáticamente con un modelo CNN y recibir recomendaciones de outfits.

## 🛠️ Stack Tecnológico

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de Datos**: MongoDB
- **Modelo ML**: CNN en TensorFlow (Python + Flask)

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- Python (v3.8 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd fashion_program
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fashion_ai
CLOUDINARY_CLOUD_NAME=tu_cloud_name (opcional)
CLOUDINARY_API_KEY=tu_api_key (opcional)
CLOUDINARY_API_SECRET=tu_api_secret (opcional)
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

**Nota**: Si no configuras Cloudinary, las imágenes se guardarán localmente en `backend/uploads/`.

### 3. Configurar Servicio ML

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Guardar el modelo CNN

1. Entrena tu modelo usando el código proporcionado
2. Guarda el modelo:

```python
# En tu script de entrenamiento
model.save('modelo_ropa.h5')
```

3. Copia el archivo `modelo_ropa.h5` a la carpeta `ml-service/`

**Importante**: Ajusta los nombres de las clases en `ml-service/app.py` según tus clases de entrenamiento:

```python
class_names = [
    'camiseta', 'pantalon', 'zapatos', 'accesorio', 'abrigo',
    'camisa', 'falda', 'botas', 'bolso', 'chaqueta'
]
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

## 🏃 Ejecutar la Aplicación

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### Terminal 2: Servicio ML

```bash
cd ml-service
source venv/bin/activate  # En Windows: venv\Scripts\activate
python app.py
```

El servicio ML estará disponible en `http://localhost:5001`

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
fashion_program/
├── backend/
│   ├── models/          # Modelos de MongoDB (Prenda, Outfit)
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Utilidades (Cloudinary)
│   ├── uploads/         # Imágenes subidas (si no usas Cloudinary)
│   ├── server.js        # Servidor Express
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/      # Páginas principales
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── ml-service/
│   ├── app.py           # Servicio Flask para el modelo
│   ├── requirements.txt
│   └── modelo_ropa.h5   # Modelo CNN (debes agregarlo)
└── README.md
```

## 🔌 API Endpoints

### Prendas

- `POST /api/prendas/upload` - Subir prenda
- `GET /api/prendas` - Obtener todas las prendas
- `GET /api/prendas/filter?type=superior` - Filtrar por tipo
- `DELETE /api/prendas/:id` - Eliminar prenda

### Clasificación

- `POST /api/classify` - Clasificar imagen (envía al servicio ML)

### Outfits

- `GET /api/outfits/recommend` - Generar recomendaciones
- `POST /api/outfits/save` - Guardar outfit
- `GET /api/outfits` - Obtener outfits guardados
- `DELETE /api/outfits/:id` - Eliminar outfit

## 🗄️ Base de Datos

### Colección: prendas

```javascript
{
  _id: ObjectId,
  imagen_url: String,
  tipo: String,           // "superior", "inferior", "zapatos", "accesorio", "abrigo"
  color: String,          // "rojo", "azul", "negro", etc.
  confianza: Number,      // 0-1
  fecha_agregada: Date
}
```

### Colección: outfits

```javascript
{
  _id: ObjectId,
  superior_id: ObjectId,
  inferior_id: ObjectId,
  zapatos_id: ObjectId,
  puntuacion: Number,     // 0-100
  fecha_creacion: Date
}
```

## 🎨 Funcionalidades

1. **Subir Prenda**: Carga una imagen, el modelo la clasifica automáticamente
2. **Galería de Prendas**: Ver todas las prendas con filtros por tipo
3. **Generar Outfits**: Algoritmo simple que combina prendas aleatoriamente
4. **Guardar Outfits**: Guarda tus outfits favoritos
5. **Eliminar**: Elimina prendas y outfits

## 🔧 Solución de Problemas

### El servicio ML no responde

- Verifica que el servicio esté corriendo en el puerto 5001
- Verifica que el modelo `modelo_ropa.h5` esté en `ml-service/`
- Revisa los logs del servicio ML para errores

### Error de conexión a MongoDB

- Verifica que MongoDB esté corriendo localmente
- O configura MongoDB Atlas y actualiza `MONGODB_URI` en `.env`

### Las imágenes no se muestran

- Si usas almacenamiento local, verifica que `backend/uploads/` exista
- Si usas Cloudinary, verifica las credenciales en `.env`

## 📝 Notas Importantes

- **Sin autenticación**: Todos ven las mismas prendas (proyecto universitario)
- **Modelo CNN**: Debes proporcionar el modelo entrenado (`modelo_ropa.h5`)
- **Clases del modelo**: Ajusta `class_names` en `ml-service/app.py` según tu modelo

## 🚀 Despliegue

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Subir carpeta dist/ a Vercel o Netlify
```

### Backend (Heroku/Railway)

```bash
cd backend
# Configurar variables de entorno en la plataforma
# Subir código
```

### Servicio ML (Railway/Render)

```bash
cd ml-service
# Configurar Python runtime
# Subir código y modelo
```

## 👥 Contribuidores

Proyecto Universitario - Enero 2026

## 📄 Licencia

Este proyecto es para uso educativo.

