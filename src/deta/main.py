from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from deta import Deta
import os
from datetime import datetime

app = FastAPI()

# Initialize Deta
deta = Deta(os.getenv("DETA_PROJECT_KEY"))
db = deta.Base("medical-records")
drive = deta.Drive("medical-files")

class Record(BaseModel):
    encrypted: dict
    timestamp: int
    type: str

class Query(BaseModel):
    id: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/store")
async def store_record(record: Record):
    try:
        result = db.put({
            "encrypted": record.encrypted,
            "timestamp": record.timestamp,
            "type": record.type,
            "created_at": datetime.now().isoformat()
        })
        return {"success": True, "id": result["key"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrieve")
async def retrieve_record(query: Query):
    try:
        result = db.get(query.id)
        if not result:
            raise HTTPException(status_code=404, detail="Record not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sync")
async def sync_records(payload: dict):
    try:
        # Store sync payload
        result = db.put({
            "payload": payload,
            "synced_at": datetime.now().isoformat()
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    try:
        records = db.fetch().items
        return {
            "total_records": len(records),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
