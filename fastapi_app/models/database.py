from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client["Note-ORG"]
collection = db["notes"]
