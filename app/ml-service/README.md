# BookLoom ML Service

Machine Learning service for BookLoom application providing semantic profiling, embeddings generation, and recommendations.

## Features

- **Profile Agent**: Creates semantic profiles for books using Google Gemini LLM
- **Embeddings**: Generates vector embeddings using Gemini Embeddings API
- **Vector Storage**: Stores embeddings in ChromaDB for similarity search
- **Redis Caching**: Caches profiles and results (30 days TTL) for token optimization
- **LlamaIndex Integration**: Uses LlamaIndex for ML orchestration

## Architecture

```
ml-service/
├── app/
│   ├── agents/
│   │   └── profile_agent.py     # Profile Agent (LlamaIndex + Gemini)
│   ├── api/
│   │   ├── health_endpoints.py  # Health check endpoints
│   │   └── profile_endpoints.py # Profile creation endpoints
│   ├── core/
│   │   ├── chroma_client.py     # ChromaDB vector store client
│   │   ├── redis_client.py      # Redis cache client
│   │   ├── config.py            # Configuration settings
│   │   └── logging.py           # Structured logging
│   ├── schemas/
│   │   └── schemas.py           # Pydantic models
│   └── main.py                  # FastAPI application
├── storage/
│   └── chroma/                  # ChromaDB persistent storage
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google Gemini API key

### Setup

1. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Check health**:
   ```bash
   curl http://localhost:8080/ml/health
   ```

### API Endpoints

#### POST /ml/books/profile

Create semantic profile for a book.

**Request**:
```json
{
  "book_metadata": {
    "book_id": "book_123",
    "title": "1984",
    "author": "George Orwell",
    "description": "Dystopian novel about totalitarian surveillance...",
    "user_notes": "Mind-blowing dystopia",
    "rating": 5.0,
    "genres": ["Fiction", "Dystopian"]
  },
  "user_id": "user_456"
}
```

**Response**:
```json
{
  "profile": {
    "book_id": "book_123",
    "themes": ["Totalitarianism", "Surveillance", "Thought Control"],
    "genres": ["Dystopian", "Political Fiction"],
    "mood": "dark",
    "complexity": "medium",
    "key_concepts": ["Big Brother", "Newspeak", "Doublethink"],
    "similar_to": ["Brave New World", "Fahrenheit 451"],
    "embedding_id": "emb_user_456_book_123",
    "metadata": {
      "title": "1984",
      "author": "George Orwell",
      "user_id": "user_456"
    },
    "created_at": "2026-02-04T14:30:00Z"
  },
  "embedding_stored": true,
  "cached": false,
  "processing_time_ms": 2345.67
}
```

#### GET /ml/health

Check service health status.

**Response**:
```json
{
  "status": "healthy",
  "service": "BookLoom ML Service",
  "version": "0.1.0",
  "components": {
    "redis": "healthy",
    "chromadb": "healthy"
  }
}
```

## Development

### Local Development (without Docker)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Redis** (separate terminal):
   ```bash
   docker run -p 6379:6379 redis:7-alpine
   ```

3. **Run application**:
   ```bash
   cd app
   uvicorn main:app --reload --host 0.0.0.0 --port 8080
   ```

### Running Tests

```bash
pytest
```

## Configuration

All configuration is done via environment variables. See `.env.example` for available options.

### Key Settings

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `REDIS_URL`: Redis connection URL (default: redis://redis:6379)
- `CHROMA_DB_PATH`: ChromaDB storage path (default: /app/storage/chroma)

## Caching Strategy

| Data Type | TTL | Cache Key Pattern |
|-----------|-----|-------------------|
| Book Profile | 30 days | `profile:{user_id}:{book_id}` |
| Recommendations | 24 hours | `rec:{user_id}:{library_hash}` |
| Graph Edges | 12 hours | `graph:{user_id}:{library_hash}` |
| User Profile | 6 hours | `user_profile:{user_id}` |

## Token Optimization

- **Redis Caching**: 70-90% reduction in API calls for repeated requests
- **Profile Reuse**: Embeddings generated once, cached for 30 days
- **Compressed Context**: Aggregated profiles instead of full book data for recommendations

## License

MIT
