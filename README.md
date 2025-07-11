# ChromoScope - AI-Powered Chromosome Analysis Platform

ChromoScope is an advanced chromosome analysis platform that leverages SAM2 (Segment Anything Model 2) for automated karyotyping and chromosome segmentation. This full-stack application provides a modern web interface for medical professionals to analyze metaphase spreads and perform chromosome classification.

## Features

- **Automated Chromosome Segmentation**: Powered by SAM2 for precise chromosome identification
- **AI-Driven Classification**: Advanced classification algorithms for chromosome analysis
- **Interactive Web Interface**: Modern, responsive UI built with React and TypeScript
- **FastAPI Backend**: High-performance Python backend with REST API endpoints
- **Real-time Processing**: Live updates during analysis workflows
- **Analysis History**: Track and review previous analyses
- **Export Capabilities**: Export results in various formats

## Architecture

```
ChromoScope/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   └── services/
├── models/            # SAM2 model files
└── docker/            # Docker configurations
```

## Prerequisites

- **Frontend**: Node.js 18+ and npm
- **Backend**: Python 3.9+ and pip
- **SAM2 Model**: Download SAM2 model weights
- **GPU**: NVIDIA GPU with CUDA support (recommended for faster processing)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ChromoScope
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Download SAM2 model weights
python scripts/download_sam2_models.py

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### 4. SAM2 Model Configuration

1. **Download SAM2 Weights**: The application will automatically download the required SAM2 model weights on first run
2. **GPU Configuration**: Ensure CUDA is properly installed if using GPU acceleration
3. **Model Path**: Models are stored in `./models/sam2/` directory

## Usage

### Web Interface

1. **Upload Image**: Navigate to the analysis page and upload a metaphase spread image
2. **Segmentation**: The SAM2 model will automatically segment individual chromosomes
3. **Classification**: AI algorithms classify each chromosome based on morphology
4. **Review Results**: Examine the analysis results and make manual corrections if needed
5. **Export**: Save results in your preferred format

### API Endpoints

- `POST /api/upload` - Upload metaphase image
- `POST /api/segment` - Perform chromosome segmentation
- `POST /api/classify` - Classify segmented chromosomes
- `GET /api/results/{analysis_id}` - Retrieve analysis results
- `GET /api/history` - Get analysis history

### Example API Usage

```python
import requests
import json

# Upload image
with open('metaphase_image.jpg', 'rb') as f:
    response = requests.post('http://localhost:8000/api/upload', files={'image': f})
    
analysis_id = response.json()['analysis_id']

# Get segmentation results
response = requests.post(f'http://localhost:8000/api/segment', json={'analysis_id': analysis_id})
segmentation_results = response.json()

# Classify chromosomes
response = requests.post(f'http://localhost:8000/api/classify', json={'analysis_id': analysis_id})
classification_results = response.json()
```

## Development

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black app/
isort app/

# Type checking
mypy app/
```

### Docker Development

```bash
# Build and run the entire stack
docker-compose up --build

# Run only the backend
docker-compose up backend

# Run only the frontend
docker-compose up frontend
```

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI components
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management

### Backend
- **FastAPI**: Modern Python web framework
- **PyTorch**: Deep learning framework
- **SAM2**: Segment Anything Model 2
- **OpenCV**: Computer vision library
- **NumPy**: Numerical computing
- **Pydantic**: Data validation
- **SQLAlchemy**: SQL toolkit and ORM

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.

## Acknowledgments

- **SAM2**: Meta's Segment Anything Model 2
- **React Community**: For the excellent ecosystem
- **FastAPI**: For the high-performance web framework
- **OpenCV**: For computer vision capabilities
