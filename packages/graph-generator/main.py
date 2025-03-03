import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import igraph as ig
import logging

from core import GraphData, LayoutResponse, generate_layout

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="graph generator")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate", response_model=LayoutResponse)
async def api_generate_layout(data: GraphData):
    try:
        return generate_layout(data)
    except Exception as e:
        logger.error(f"Layout generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Layout generation failed: {str(e)}"
        )


@app.get("/")
async def health_check():
    return {"status": "healthy", "igraph_version": ig.__version__}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
