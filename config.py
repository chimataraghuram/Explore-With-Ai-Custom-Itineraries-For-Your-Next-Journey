import os
from dotenv import load_dotenv

load_dotenv()

#configure api key
api_key = os.getenv('GOOGLE_API_KEY')

if not api_key:
    raise ValueError("Missing API key. Please set it in the .env file.")