# Kaizen ML Backend

A powerful machine learning backend for the Kaizen journaling app, built with Hugging Face models and Express.js.

## 🚀 Features

### Advanced Sentiment Analysis
- **Multi-dimensional sentiment analysis** using state-of-the-art models
- **Emotion detection** (joy, sadness, anger, fear, surprise, disgust)
- **Confidence scoring** for all predictions
- **Real-time processing** with Hugging Face inference API

### Intelligent Theme Extraction
- **Zero-shot classification** for theme detection
- **Advanced categorization** (work, relationships, health, personal, creativity, spirituality)
- **Confidence-based ranking** of themes
- **Context-aware analysis**

### Personalized AI Features
- **Dynamic prompt generation** based on user mood and goals
- **Writing pattern analysis** (word count, complexity, consistency)
- **Weekly/monthly summaries** with insights and trends
- **Personalized recommendations** for journaling practice

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- Hugging Face API key
- npm or yarn

### Installation

1. **Clone and navigate to the backend directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp env.example .env
```

4. **Edit `.env` file with your configuration:**
```env
PORT=3001
NODE_ENV=development
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
CORS_ORIGIN=http://localhost:8080
```

5. **Get a Hugging Face API key:**
   - Visit [Hugging Face](https://huggingface.co/settings/tokens)
   - Create a new token
   - Add it to your `.env` file

### Running the Backend

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Sentiment & Emotion Analysis
```
POST /api/analyze
Body: { "text": "Your journal entry text" }
```

### Theme Extraction
```
POST /api/themes
Body: { "text": "Your journal entry text" }
```

### Personalized Prompts
```
POST /api/prompts
Body: {
  "recentEntries": ["entry1", "entry2"],
  "currentMood": 7,
  "userGoals": ["stress", "growth"],
  "dominantEmotion": "joy"
}
```

### Writing Pattern Analysis
```
POST /api/patterns
Body: {
  "entries": [
    {
      "content": "Entry text",
      "timestamp": "2024-01-01T00:00:00Z",
      "mood": 8
    }
  ]
}
```

### Summary Generation
```
POST /api/summary
Body: {
  "entries": [
    {
      "content": "Entry text",
      "timestamp": "2024-01-01T00:00:00Z",
      "mood": 8,
      "themes": ["gratitude", "relationships"]
    }
  ]
}
```

### Batch Analysis
```
POST /api/batch-analyze
Body: {
  "entries": [
    { "id": "1", "content": "Entry 1" },
    { "id": "2", "content": "Entry 2" }
  ]
}
```

## 🤖 ML Models Used

### Sentiment Analysis
- **Model**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Purpose**: Advanced sentiment classification
- **Output**: Positive/Negative/Neutral with confidence scores

### Emotion Detection
- **Model**: `j-hartmann/emotion-english-distilroberta-base`
- **Purpose**: Multi-emotion classification
- **Output**: Joy, Sadness, Anger, Fear, Surprise, Disgust scores

### Theme Extraction
- **Model**: `facebook/bart-large-mnli`
- **Purpose**: Zero-shot classification for themes
- **Output**: Ranked themes with confidence scores

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `HUGGINGFACE_API_KEY` | Hugging Face API key | Required |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:8080 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Purpose**: Prevent API abuse and ensure fair usage

## 🔒 Security

### CORS Configuration
- **Origin**: Configurable via environment variable
- **Methods**: POST, GET
- **Headers**: Content-Type, Authorization

### Error Handling
- **Graceful degradation** when ML services fail
- **Detailed error logging** for debugging
- **User-friendly error messages**

## 📊 Performance

### Optimization Features
- **Singleton pattern** for ML service instances
- **Efficient model loading** and caching
- **Batch processing** for multiple entries
- **Async/await** for non-blocking operations

### Monitoring
- **Health check endpoint** for uptime monitoring
- **Detailed logging** for debugging
- **Error tracking** and reporting

## 🧪 Testing

```bash
npm test
```

## 📝 Development

### Project Structure
```
server/
├── index.ts              # Main server file
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── env.example           # Environment template
└── src/
    └── lib/
        └── backendML.ts  # ML service implementation
```

### Adding New Features
1. **Add new methods** to `BackendMLService`
2. **Create API endpoints** in `index.ts`
3. **Update frontend service** in `src/lib/mlService.ts`
4. **Test thoroughly** with various inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the health endpoint: `GET /health`
- Review error logs in console
- Ensure Hugging Face API key is valid
- Verify CORS configuration matches frontend URL
