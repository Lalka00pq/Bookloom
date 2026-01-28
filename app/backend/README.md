<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">BookLoom Backend</h3>

  <p align="center">
    Powerful API server for book graph visualization and AI-powered recommendations
    <br />
    <a href="http://localhost:8000"><strong>View API Docs »</strong></a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#features">Features</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

BookGraph Backend is a RESTful API service that powers the BookGraph application. It handles all server-side operations including book data management, graph generation, AI-powered recommendations, and health monitoring. The backend is built with Python frameworks and provides robust endpoints for:

- **Book Management**: CRUD operations for books and library management
- **Graph Generation**: Build and analyze connections between books and themes
- **AI Recommendations**: Generate intelligent book recommendations using LLMs
- **Search Functionality**: Full-text search and filtering capabilities
- **Health Monitoring**: Real-time system health checks and performance metrics

### Built With

The backend is built using modern Python technologies:

* [![FastAPI][FastAPI]][FastAPI-url] - Modern web framework for building APIs
* [![Python][Python]][Python-url] - High-level programming language
* [![Pydantic][Pydantic]][Pydantic-url] - Data validation using Python type annotations

### Features

- 🔗 **Graph Analysis**: Build and visualize relationships between books and themes
- 📊 **Data Management**: RESTful API for complete book library management
- 🤖 **AI Recommendations**: Smart recommendations powered by LLMs
- 🔍 **Advanced Search**: Powerful search with filters and sorting
- 💚 **Health Monitoring**: System metrics and availability checks

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

* [Python](https://www.python.org/) (version 3.10 or higher)
* [pip](https://pip.pypa.io/) (comes with Python) or [Uv](https://docs.astral.sh/uv/)
* [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Installation

1. Navigate to the backend directory
   ```sh
   cd app/backend
   ```

2. Create a virtual environment
   ```sh
   python -m venv venv
   ```

3. Activate the virtual environment
   ```sh
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

4. Install dependencies
   ```sh
   pip install -r requirements.txt
   # or
   uv sync
   ```

5. Configure environment variables and don't forget to set up your env variables in .env file
   ```sh
   cp .env-example .env
   # Edit .env with your configuration
   ```

6. Start the server
   ```sh
   fastapi run app/main.py --reload
   ```

The API will be available at `http://localhost:8000`




<!-- USAGE -->
## Usage

### Development

Run the development server with auto-reload:

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

Access the interactive API documentation at `http://localhost:8000/docs`

### Production Deployment

Build the Docker image:

```bash
docker build -t bookloom-backend .
```

Run the container:

```bash
docker run -p 8000:8000 --env-file .env bookloom-backend
```


### API Endpoints

Key API endpoints include:

1. **Books**: `GET/POST /api/books` - Manage book collection
2. **Graph**: `GET /graph` - Graph operations
   1. **Get Graph**: `GET /graph/show_graph` - Get graph data
   2. **Add Node to Graph**: `GET /graph/add_node` - Add node to graph
   3. **Remove Node from Graph**: `DELETE /graph/remove_node/{node_id}` - Remove node from graph
   4. **Change Node in Graph**: `PUT /graph/change_node/{node_id}` - Change node in graph
   5. **Add Edge to Graph**: `GET /graph/add_edge` - Add edge to graph
   6. **Remove Node from Graph**: `DELETE /graph/remove_edge/{source_id}/{target_id}` - Remove edge from graph
3. **Search**: `POST /books/search` - Search for books
4. **Add books**: `POST /books/add_to_graph` - Add new books to the collection**
5. **Recommendations**: `POST /analytics/recommendations` - Get AI-powered recommendations
6. **Health**: `GET /health/check` - Check server health

For complete documentation, visit `http://localhost:8000/docs` when the server is running





<!-- PROJECT STRUCTURE -->
## Project Structure

```
app/backend/
├── app/
│   ├── api/                          # API endpoints
│   │   ├── book_graph_endpoints.py   # Book and graph operations
│   │   ├── graph_endpoints.py        # Graph analysis endpoints
│   │   ├── health_check.py           # Health check endpoints
│   │   ├── recommendations_endpoints.py # AI recommendations
│   │   ├── search_endpoints.py       # Search functionality
│   │   └── __init__.py
│   ├── core/                         # Core business logic
│   │   ├── config.py                 # Configuration management
│   │   ├── graph.py                  # Graph operations and analysis
│   │   ├── health_monitor.py         # Health monitoring service
│   │   ├── logging.py                # Logging configuration
│   │   ├── recommendation_service.py # AI recommendation engine
│   │   └── __init__.py
│   ├── schemas/                      # Pydantic data models
│   │   ├── books.py                  # Book data schema
│   │   ├── books_search.py           # Search schema
│   │   ├── graph.py                  # Graph schema
│   │   ├── recommendations.py        # Recommendation schema
│   │   └── __init__.py
│   ├── prompts/                      # LLM prompts
│   ├── main.py                       # Application entry point
│   └── __init__.py
├── tests/                            # Test suite
├── Dockerfile                        # Docker configuration
├── requirements.txt                  # Python dependencies
└── README.md                         # This file
```

### Directory Descriptions

- **api/**: Contains all API route handlers and endpoint definitions
- **core/**: Core application logic including configuration, database operations, and services
- **schemas/**: Pydantic models for request/response validation and type checking
- **prompts/**: LLM prompt templates for AI-powered features
- **tests/**: Automated tests for API endpoints and core functionality




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[FastAPI]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com/
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Pydantic]: https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white
[Pydantic-url]: https://docs.pydantic.dev/


