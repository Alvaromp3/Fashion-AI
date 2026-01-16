# Fashion AI - Outfit Recommender

Web application to upload clothing images, automatically classify them using a CNN model, and receive outfit recommendations.

## Tech Stack

* Frontend: React.js + Vite + Tailwind CSS
* Backend: Node.js + Express
* Database: MongoDB
* ML Model: CNN in TensorFlow (Python + Flask)

## Prerequisites

* Node.js (v18 or higher)
* Python (v3.8 or higher)
* MongoDB (local or MongoDB Atlas)
* npm or yarn

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository>
cd fashion_program
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fashion_ai
CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
```

Note: If you do not configure Cloudinary, images will be stored locally in `backend/uploads/`.

### 3. ML Service Setup

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Save the CNN Model

1. Train your model using your training script
2. Save the model:

```python
# In your training script
model.save('modelo_ropa.h5')
```

3. Copy the file `modelo_ropa.h5` into the `ml-service/` folder

Important: Adjust the class names in `ml-service/app.py` to match your trained classes:

```python
class_names = [
    'camiseta', 'pantalon', 'zapatos', 'accesorio', 'abrigo',
    'camisa', 'falda', 'botas', 'bolso', 'chaqueta'
]
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Backend will be available at `http://localhost:5000`

### Terminal 2: ML Service

```bash
cd ml-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

ML service will be available at `http://localhost:5001`

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
fashion_program/
├── backend/
│   ├── models/          # MongoDB models (Garment, Outfit)
│   ├── routes/          # API routes
│   ├── utils/           # Utilities (Cloudinary)
│   ├── uploads/         # Uploaded images (if not using Cloudinary)
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Main pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── ml-service/
│   ├── app.py           # Flask service for the ML model
│   ├── requirements.txt
│   └── modelo_ropa.h5   # CNN model (you must add this)
└── README.md
```

## API Endpoints

### Garments

* POST `/api/prendas/upload` - Upload garment
* GET `/api/prendas` - Get all garments
* GET `/api/prendas/filter?type=superior` - Filter by type
* DELETE `/api/prendas/:id` - Delete garment

### Classification

* POST `/api/classify` - Classify image (sent to ML service)

### Outfits

* GET `/api/outfits/recommend` - Generate recommendations
* POST `/api/outfits/save` - Save outfit
* GET `/api/outfits` - Get saved outfits
* DELETE `/api/outfits/:id` - Delete outfit

## Database

### Collection: prendas

```javascript
{
  _id: ObjectId,
  imagen_url: String,
  tipo: String,           // "superior", "inferior", "zapatos", "accesorio", "abrigo"
  color: String,         // "red", "blue", "black", etc.
  confianza: Number,    // 0-1
  fecha_agregada: Date
}
```

### Collection: outfits

```javascript
{
  _id: ObjectId,
  superior_id: ObjectId,
  inferior_id: ObjectId,
  zapatos_id: ObjectId,
  puntuacion: Number,   // 0-100
  fecha_creacion: Date
}
```

## Features

1. Upload Garment: Upload an image and let the model classify it automatically
2. Garment Gallery: View all garments with filters by type
3. Generate Outfits: Simple algorithm that randomly combines garments
4. Save Outfits: Save your favorite outfits
5. Delete: Remove garments and outfits

## Troubleshooting

### ML Service Not Responding

* Make sure the service is running on port 5001
* Check that `modelo_ropa.h5` is inside `ml-service/`
* Review ML service logs for errors

### MongoDB Connection Error

* Verify MongoDB is running locally
* Or configure MongoDB Atlas and update `MONGODB_URI` in `.env`

### Images Not Displaying

* If using local storage, ensure `backend/uploads/` exists
* If using Cloudinary, verify credentials in `.env`

## Important Notes

* No authentication: Everyone sees the same garments (university project)
* CNN Model: You must provide the trained model file (`modelo_ropa.h5`)
* Model Classes: Update `class_names` in `ml-service/app.py` to match your model

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Upload the dist/ folder to Vercel or Netlify
```

### Backend (Heroku/Railway)

```bash
cd backend
# Configure environment variables on the platform
# Deploy the code
```

### ML Service (Railway/Render)

```bash
cd ml-service
# Configure Python runtime
# Deploy code and model
```

## Contributors

University Project - January 2026

## License

This project is for educational use only.
