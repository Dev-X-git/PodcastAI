from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session 
from fastapi import Depends, status
from database import get_db
from schemas import ScriptBase, Script
from models import Script as ScriptModel 
from pydantic import BaseModel
from sqlalchemy import func
import time
from sqlalchemy import func
from typing import List, Dict, Union
router = APIRouter()
from datetime import datetime

#Response Model define
class ScriptResponse(BaseModel):
    exists: bool
    script: Script = None  

class StartTimeCount(BaseModel):
    start_time: str 
    count: int

#Endpoint: Get Scripts
@router.get("/", response_model=List[Script])
def read_scripts(skip: int = 0, limit: int = 100, start_time: str = None, db: Session = Depends(get_db)):
    #read all script and sort by id number
    query = db.query(ScriptModel).order_by(ScriptModel.id)
    #if start time define, get all scripts start with start_time
    if start_time:
        query = query.filter(ScriptModel.start_time == start_time)
    scripts = query.offset(skip).limit(limit).all()
    scripts_data = []
    for script in scripts:
        script_data = {
            "id": script.id,
            "title": script.title,
            "gscript": script.gscript,
            "start_time": script.start_time,
            "end_time": script.end_time,
            "category": script.category,
            "type_content": script.type_content,
            "audio_path": f"/media/podcast{script.id}.mp3"  # Assuming audio_path is the filename of the audio file
        }
        scripts_data.append(script_data)
    return scripts_data

#Endpoint: Create Script
@router.post("/", response_model=Script)
def create_script(script: ScriptBase, db: Session = Depends(get_db)):
    db_script = ScriptModel(**script.dict())
    db.add(db_script)
    db.commit()
    db.refresh(db_script)
    return db_script

#Endpoint: Update Script by id
@router.put("/{script_id}", response_model=Script)
def update_script(script_id: int, script: ScriptBase, db: Session = Depends(get_db)):
    db_script = db.query(ScriptModel).filter(ScriptModel.id == script_id).first()
    if db_script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    for key, value in script.dict().items():
        setattr(db_script, key, value)
    db.commit()
    db.refresh(db_script)
    return db_script

#Endpoint: Delete Script by id
@router.delete("/{script_id}")
def delete_script(script_id: int, db: Session = Depends(get_db)):
    db_script = db.query(ScriptModel).filter(ScriptModel.id == script_id).first()
    if db_script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    db.delete(db_script)
    db.commit()
    return {"detail": "Script deleted"}


#Endpoint: check title is exist on db or not, checking duplicaiton.
@router.get("/title/{script_title}", response_model=ScriptResponse)
def read_script_by_title(script_title: str, db: Session = Depends(get_db)):
    retry_count = 0
    delay = 2  # delay in seconds
    while True:
        try:
            db_script = db.query(ScriptModel).filter(ScriptModel.title == script_title).first()
            if db_script is None:
                return {"exists": False, "detail": "Script not found"}
            return {"exists": True, "script": db_script}
            break  # If successful, break the loop
        except Exception as e:  # Catch any exceptions
            if retry_count >= 7:  # Maximum retries
                raise HTTPException(status_code=500, detail=f"Error at title validation: {e}. Maximum retries exceeded.")
            else:
                print(f"Error at title validation : {e}. Retrying in {delay} seconds...")
                time.sleep(delay)
                retry_count += 1
                delay *= 2  # Double the delay for exponential backoff


##Endpoint: Get record counts start with start_time
@router.get("/start-time-counts", response_model=List[StartTimeCount])
def get_start_time_counts(db: Session = Depends(get_db)):
    start_time_counts = (
        db.query(ScriptModel.start_time, func.count(ScriptModel.id).label("count"))
        .group_by(ScriptModel.start_time)
        .all()
    )
    # Ensure start_time is serialized to a string
    return [{"start_time": start_time.isoformat(), "count": count} for start_time, count in start_time_counts]

#Endpoint: Read Script by script_id
@router.get("/{script_id}", response_model=Script)
def read_script(script_id: int, db: Session = Depends(get_db)):
    db_script = db.query(ScriptModel).filter(ScriptModel.id == script_id).first()
    if db_script is None:
        raise HTTPException(status_code=404, detail="Script not found")
    return db_script