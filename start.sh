#!/bin/bash

echo "🚀 Starting Parkinson's Voice Detection System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if the model files exist
if [ ! -f "parkinson_voice_model/models/parkinsons_xgboost_model.pkl" ]; then
    echo "❌ Model files not found. Please ensure the pre-trained models are in the correct location."
    echo "Expected: parkinson_voice_model/models/parkinsons_xgboost_model.pkl"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo "🔧 Building and starting services..."

# Build and start services
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check backend
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 System startup complete!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "🛑 To stop the system, run: docker-compose down"
echo "📝 To view logs, run: docker-compose logs -f"
