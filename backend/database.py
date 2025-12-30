from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Create a database file named "food_app.db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./food_app.db"

# 2. Connect to it
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session maker (this is how we actually talk to the db)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create the base class for our data models
Base = declarative_base()

# 5. Dependency (We will use this later in main.py)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()