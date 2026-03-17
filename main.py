from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import items, users

# 创建数据库表
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Company OS API", description="AI 数字公司操作系统 API", version="1.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(items.router, prefix="/api/items", tags=["items"])


@app.get("/")
def read_root():
    return {"message": "Welcome to AI Company OS API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# 添加 Prometheus 指标端点
@app.get("/metrics")
def metrics():
    # 这里可以添加实际的指标收集逻辑
    # 例如请求计数、响应时间等
    return {"requests_total": 100, "response_time_seconds": 0.1, "uptime_seconds": 3600}
