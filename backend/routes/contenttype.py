from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()
 
 #Create Content Type
@router.post("/", response_model=schemas.ContentType)
def create_content_type(content_type: schemas.ContentTypeCreate, db: Session = Depends(get_db)):
    # Check if a content type with the same title already exists
    existing_content_type = db.query(models.ContentType).filter(models.ContentType.title == content_type.title).first()
    if existing_content_type:
        raise HTTPException(status_code=400, detail="Content type with this title already exists")
    
    #Create Content type
    db_content_type = models.ContentType(title=content_type.title)
    db.add(db_content_type)
    db.commit()
    db.refresh(db_content_type)
    return db_content_type

#Read All Content Type
@router.get("/", response_model=list[schemas.ContentType])
def read_content_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    content_types = db.query(models.ContentType).offset(skip).limit(limit).all()
    return content_types

#Read content type by id
@router.get("/{content_type_id}", response_model=schemas.ContentType)
def read_content_type(content_type_id: int, db: Session = Depends(get_db)):
    content_type = db.query(models.ContentType).filter(models.ContentType.id == content_type_id).first()
    if content_type is None:
        raise HTTPException(status_code=404, detail="Content type not found")
    return content_type

#Delete content type by id

@router.delete("/{content_type_id}")
def delete_content_type(content_type_id: int, db: Session = Depends(get_db)):
    content_type = db.query(models.ContentType).filter(models.ContentType.id == content_type_id).first()
    if content_type is None:
        raise HTTPException(status_code=404, detail="Content type not found")
    db.delete(content_type)
    db.commit()
    return {"message": "Content type deleted successfully"}

#Update content type by id
@router.put("/{content_type_id}", response_model=schemas.ContentType)
def update_content_type(content_type_id: int, content_type: schemas.ContentTypeCreate, db: Session = Depends(get_db)):
    db_content_type = db.query(models.ContentType).filter(models.ContentType.id == content_type_id).first()
    if db_content_type is None:
        raise HTTPException(status_code=404, detail="Content type not found")
    
    db_content_type.title = content_type.title
    db.commit()
    db.refresh(db_content_type)
    return db_content_type