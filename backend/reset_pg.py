import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def reset_db():
    engine = create_async_engine(settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1))
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
    print("Database schema reset successfully.")

if __name__ == "__main__":
    from sqlalchemy import text
    asyncio.run(reset_db())
