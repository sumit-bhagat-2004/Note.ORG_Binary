from fastapi import FastAPI
from routes.process import router

app = FastAPI()

# Include Routes
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Welcome to Note-ORG API"}

# Run the app using: uvicorn main:app --reload
