# project
from api.health_check import router as health_router
from api.graph_endpoints import router as graph_router
# 3rd party
from fastapi import FastAPI
import uvicorn


app = FastAPI()
app.include_router(health_router, tags=["health-check"])
app.include_router(graph_router, prefix="/graph", tags=["graph"])


if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)
