# project
from app.api.health_check import router as health_router
from app.api.graph_endpoints import router as graph_router
from app.api.search_endpoints import router as search_router
# 3rd party
from fastapi import FastAPI
import uvicorn

app = FastAPI()
app.include_router(health_router, tags=["health-check"])
app.include_router(graph_router, prefix="/graph", tags=["graph"])
app.include_router(search_router, prefix="/books", tags=["books-search"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
