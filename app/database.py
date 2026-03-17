import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 加载环境变量
load_dotenv()

# 数据库连接配置
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:DY5545782kkz@localhost:5432/ai_company_os"
)

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL, echo=True, connect_args={"options": "-c client_encoding=utf8"}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
