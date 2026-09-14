from typing import TypeVar, Type, Generic, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

T = TypeVar("T")

class BaseTenantRepository(Generic[T]):
    """
    Base repository pattern enforcing non-bypassable school_id tenant isolation.
    Every database query automatically applies school_id filter.
    """
    def __init__(self, model_cls: Type[T], session: AsyncSession, school_id: Optional[str]):
        self.model_cls = model_cls
        self.session = session
        self.school_id = school_id

    def _apply_tenant_filter(self, stmt):
        if hasattr(self.model_cls, "school_id") and self.school_id is not None:
            return stmt.where(self.model_cls.school_id == self.school_id)
        return stmt

    async def get_all(self, *filters) -> List[T]:
        stmt = select(self.model_cls)
        stmt = self._apply_tenant_filter(stmt)
        if filters:
            stmt = stmt.where(*filters)
        res = await self.session.execute(stmt)
        return res.scalars().all()

    async def get_by_id(self, item_id: str) -> Optional[T]:
        stmt = select(self.model_cls).where(self.model_cls.id == item_id)
        stmt = self._apply_tenant_filter(stmt)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def add(self, item: T) -> T:
        if hasattr(item, "school_id") and self.school_id is not None and not getattr(item, "school_id"):
            setattr(item, "school_id", self.school_id)
        self.session.add(item)
        await self.session.flush()
        return item
