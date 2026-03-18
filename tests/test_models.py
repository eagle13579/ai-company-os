from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemCreate
from app.schemas.user import UserCreate


def test_user_model():
    """测试用户模型"""
    user_data = UserCreate(
        name="Test User", email="test@example.com", password="password123"
    )
    user = User(**user_data.model_dump(exclude={"password"}))
    assert user.name == "Test User"
    assert user.email == "test@example.com"


def test_item_model():
    """测试物品模型"""
    item_data = ItemCreate(
        name="Test Item", description="This is a test item", price=10.99
    )
    item = Item(**item_data.model_dump())
    assert item.name == "Test Item"
    assert item.description == "This is a test item"
    assert item.price == 10.99
