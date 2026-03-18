import json
from typing import Any, Optional

import redis


class CacheService:
    """缓存服务"""

    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0):
        """初始化缓存服务"""
        self.redis_client = redis.Redis(
            host=host, port=port, db=db, decode_responses=True
        )

    def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        try:
            value = self.redis_client.get(key)
            if value and isinstance(value, (str, bytes, bytearray)):
                return json.loads(value)
            return None
        except Exception as e:
            print(f"获取缓存失败: {e}")
            return None

    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """设置缓存值"""
        try:
            self.redis_client.setex(key, expire, json.dumps(value, ensure_ascii=False))
            return True
        except Exception as e:
            print(f"设置缓存失败: {e}")
            return False

    def delete(self, key: str) -> bool:
        """删除缓存值"""
        try:
            self.redis_client.delete(key)
            return True
        except Exception as e:
            print(f"删除缓存失败: {e}")
            return False

    def clear(self, pattern: str = "*") -> bool:
        """清除缓存"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys and isinstance(keys, (list, tuple)):
                self.redis_client.delete(*keys)
            return True
        except Exception as e:
            print(f"清除缓存失败: {e}")
            return False


# 创建缓存服务实例
cache_service = CacheService()
