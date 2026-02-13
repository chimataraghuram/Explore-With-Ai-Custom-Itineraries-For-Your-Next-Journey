from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from travel import generate_itinerary, generate_travel_content, generate_packing_checklist
import uvicorn
import os

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItineraryRequest(BaseModel):
    destination: str
    days: int
    nights: int
    description: str

class ContentRequest(BaseModel):
    content_type: str
    destination: str
    extra_info: str

@app.post("/api/generate-itinerary")
async def api_itinerary(request: ItineraryRequest):
    try:
        itinerary = generate_itinerary(
            destination=request.destination,
            days=request.days,
            nights=request.nights,
            description=request.description
        )
        return {"itinerary": itinerary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-content")
async def api_content(request: ContentRequest):
    try:
        content = generate_travel_content(
            content_type=request.content_type,
            destination=request.destination,
            extra_info=request.extra_info
        )
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PackingRequest(BaseModel):
    destination: str
    month: str
    days: int
    activities: str

@app.post("/api/generate-packing")
async def api_packing(request: PackingRequest):
    try:
        checklist = generate_packing_checklist(
            destination=request.destination,
            month=request.month,
            days=request.days,
            activities=request.activities
        )
        return {"checklist": checklist}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files from the 'docs' directory
if os.path.exists("docs"):
    app.mount("/", StaticFiles(directory="docs", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
