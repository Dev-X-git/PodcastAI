from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

#Endpoint: Create prompt
@router.post("/", response_model=schemas.Prompt)
def create_prompt(prompt: schemas.PromptCreate, db: Session = Depends(get_db)):
    db_prompt = models.UserPrompt(title=prompt.title, description=prompt.description)
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

#Endpoint: Read all prompts
@router.get("/", response_model=list[schemas.Prompt])
def read_prompts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prompts = db.query(models.UserPrompt).offset(skip).limit(limit).all()
    return prompts

#Endpoint: Read prompt by id
@router.get("/{prompt_id}", response_model=schemas.Prompt)
def read_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(models.UserPrompt).filter(models.UserPrompt.id == prompt_id).first()
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

#Endpoint: Delete prompt by id
@router.delete("/{prompt_id}")
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    prompt = db.query(models.UserPrompt).filter(models.UserPrompt.id == prompt_id).first()
    if prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt deleted successfully"}

#Endpoint: Update prompt by id
@router.put("/{prompt_id}", response_model=schemas.Prompt)
def update_prompt(prompt_id: int, prompt: schemas.PromptCreate, db: Session = Depends(get_db)):
    db_prompt = db.query(models.UserPrompt).filter(models.UserPrompt.id == prompt_id).first()
    if db_prompt is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    db_prompt.title = prompt.title
    db_prompt.description = prompt.description
    db.commit()
    db.refresh(db_prompt)
    return db_prompt