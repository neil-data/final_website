import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY        = os.getenv("GROQ_API_KEY")
DB_PATH             = os.getenv("DB_PATH", "copilot.db")
PORT                = int(os.getenv("PORT", 8000))
CORS_ORIGINS        = os.getenv("CORS_ORIGINS", "*").split(",")
MANUAL_OFFICER_TIME = int(os.getenv("MANUAL_OFFICER_TIME", 480))
GROQ_MODEL          = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")