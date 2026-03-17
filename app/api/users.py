from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.auth import auth_service
from app.services.cache import cache_service
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

router = APIRouter()


# 依赖项：获取当前用户
def get_current_user(
    authorization: str = Header(...), db: Session = Depends(get_db)
):
    """获取当前用户"""
    try:
        token = authorization.split(" ")[1]
        payload = auth_service.decode_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=401, detail="Could not validate credentials"
            )
        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(
            status_code=401, detail="Could not validate credentials"
        )


@router.get("/", response_model=list[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # 尝试从缓存获取
    cache_key = f"users:{skip}:{limit}"
    cached_users = cache_service.get(cache_key)
    if cached_users:
        return cached_users

    # 从数据库获取
    users = db.query(User).offset(skip).limit(limit).all()

    # 转换为响应模型并缓存
    user_responses = [UserResponse.model_validate(user) for user in users]
    cache_service.set(
        cache_key, [user.model_dump() for user in user_responses]
    )

    return user_responses


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    # 尝试从缓存获取
    cache_key = f"user:{user_id}"
    cached_user = cache_service.get(cache_key)
    if cached_user:
        return cached_user

    # 从数据库获取
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 转换为响应模型并缓存
    user_response = UserResponse.model_validate(user)
    cache_service.set(cache_key, user_response.model_dump())

    return user_response


@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # 检查邮箱是否已存在
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 创建用户，密码哈希处理
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=auth_service.get_password_hash(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 清除缓存
    cache_service.clear("users:*")

    return db_user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 更新用户信息
    for key, value in user.model_dump(exclude_unset=True).items():
        if key == "password":
            setattr(
                db_user, "password_hash", auth_service.get_password_hash(value)
            )
        else:
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)

    # 清除缓存
    cache_service.delete(f"user:{user_id}")
    cache_service.clear("users:*")

    return db_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()

    # 清除缓存
    cache_service.delete(f"user:{user_id}")
    cache_service.clear("users:*")

    return {"message": "User deleted successfully"}


@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    """用户登录"""
    # 查找用户
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=401, detail="Incorrect email or password"
        )

    # 验证密码
    if not auth_service.verify_password(user.password, str(db_user.password_hash)):
        raise HTTPException(
            status_code=401, detail="Incorrect email or password"
        )

    # 创建访问令牌
    access_token = auth_service.create_access_token(
        data={"sub": str(db_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
