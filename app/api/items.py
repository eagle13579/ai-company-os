from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services.cache import cache_service

router = APIRouter()


@router.get("/", response_model=list[ItemResponse])
def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # 尝试从缓存获取
    cache_key = f"items:{skip}:{limit}"
    cached_items = cache_service.get(cache_key)
    if cached_items:
        return cached_items

    # 从数据库获取
    items = db.query(Item).offset(skip).limit(limit).all()

    # 转换为响应模型并缓存
    item_responses = [ItemResponse.model_validate(item) for item in items]
    cache_service.set(cache_key, [item.model_dump() for item in item_responses])

    return item_responses


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    # 尝试从缓存获取
    cache_key = f"item:{item_id}"
    cached_item = cache_service.get(cache_key)
    if cached_item:
        return cached_item

    # 从数据库获取
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    # 转换为响应模型并缓存
    item_response = ItemResponse.model_validate(item)
    cache_service.set(cache_key, item_response.model_dump())

    return item_response


@router.post("/", response_model=ItemResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    # 清除缓存
    cache_service.clear("items:*")

    return db_item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    # 更新物品信息
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)

    # 清除缓存
    cache_service.delete(f"item:{item_id}")
    cache_service.clear("items:*")

    return db_item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()

    # 清除缓存
    cache_service.delete(f"item:{item_id}")
    cache_service.clear("items:*")

    return {"message": "Item deleted successfully"}
