from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
import subprocess
import os

router = APIRouter()

#backup db
@router.post("/backup")
async def backup_database():
    try:
        #define url will be saved
        backup_file = os.path.join("dbs/", "backup.sql")
        pg_dump_path = "pg_dump"  # Use the system's pg_dump
        subprocess.run([
            pg_dump_path,
            "-h", os.getenv("DB_HOST"),
            "-U", os.getenv("DB_USER"),
            "-d", os.getenv("DB_NAME"),
            "-f", backup_file
        ], check=True, env={"PGPASSWORD": os.getenv("DB_PASSWORD")})

        def iterfile():
            with open(backup_file, mode="rb") as file_like:
                yield from file_like
        #return backup file as stream
        return StreamingResponse(iterfile(), media_type='application/octet-stream', headers={"Content-Disposition": "attachment; filename=backup.sql"})
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {e}")

#resotre db
@router.post("/restore")
async def restore_database(file: UploadFile = File(...)):
    try:
        #deifne restore db url
        file_location = f"./{file.filename}"
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # To restore using the system's pg_dump
        subprocess.run([
            "psql",
            "-h", os.getenv("DB_HOST"),
            "-U", os.getenv("DB_USER"),
            "-d", os.getenv("DB_NAME"),
            "-f", file_location
        ], check=True, env={"PGPASSWORD": os.getenv("DB_PASSWORD")})
        return {"message": "Restore successful"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {e}")