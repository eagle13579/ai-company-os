def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_read_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_user(client):
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    }
    response = client.post("/api/users", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"
    assert "id" in data


def test_get_users(client):
    # 先创建一个用户
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    }
    client.post("/api/users", json=user_data)

    # 获取用户列表
    response = client.get("/api/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_create_item(client):
    item_data = {
        "name": "Test Item",
        "description": "This is a test item",
        "price": 10.99,
    }
    response = client.post("/api/items", json=item_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["description"] == "This is a test item"
    assert data["price"] == 10.99
    assert "id" in data


def test_get_items(client):
    # 先创建一个物品
    item_data = {
        "name": "Test Item",
        "description": "This is a test item",
        "price": 10.99,
    }
    client.post("/api/items", json=item_data)

    # 获取物品列表
    response = client.get("/api/items")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
