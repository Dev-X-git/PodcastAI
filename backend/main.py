from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import engine
import models
from routes import prompts, generation, userprompts,scripts, db_manage, contenttype
from google.cloud import texttospeech
from starlette.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.staticfiles import StaticFiles


# Create tables
models.Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="My backend"
)
#make static files
app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/dbs", StaticFiles(directory="dbs"), name="dbs")

# set up middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#load env file and access the environment variable
load_dotenv()
 
google_credentials = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Include routers
app.include_router(prompts.router, prefix="/prompts", tags=["prompts"])  #prompt handling
app.include_router(scripts.router, prefix="/scripts", tags=["scripts"])  #script table handling
app.include_router(userprompts.router, prefix="/userprompts", tags=["userprompts"]) #user prompt
app.include_router(generation.router, tags=["generation"])  #text and audio generation
app.include_router(db_manage.router,prefix="/db", tags=["db management"])  # db backup and restore
app.include_router(contenttype.router,prefix="/content-type", tags=["content type"])  #content type table hanlding