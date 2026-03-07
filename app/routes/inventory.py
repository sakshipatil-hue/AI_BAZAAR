"""Inventory routes – full CRUD for products + low-stock alerts."""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_shopkeeper
from app.models import Product, Shopkeeper
from app.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = Query(None),
    low_stock: bool = Query(False, description="Return only items below reorder level"),
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    q = db.query(Product).filter(
        Product.shopkeeper_id == current.id,
        Product.is_active == True,
    )
    if category:
        q = q.filter(Product.category == category)
    if low_stock:
        q = q.filter(Product.quantity <= Product.reorder_level)
    return q.all()


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    product = Product(**payload.model_dump(), shopkeeper_id=current.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    product = _get_or_404(db, product_id, current.id)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    product = _get_or_404(db, product_id, current.id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    product = _get_or_404(db, product_id, current.id)
    product.is_active = False   # soft delete
    db.commit()


@router.get("/alerts/low-stock", response_model=List[ProductOut])
def low_stock_alerts(
    db: Session = Depends(get_db),
    current: Shopkeeper = Depends(get_current_shopkeeper),
):
    """Returns all products at or below their reorder level."""
    items = (
        db.query(Product)
        .filter(
            Product.shopkeeper_id == current.id,
            Product.is_active == True,
            Product.quantity <= Product.reorder_level,
        )
        .all()
    )
    return items


# ── Helper ───────────────────────────────────────────────────────
def _get_or_404(db: Session, product_id: int, shopkeeper_id: int) -> Product:
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.shopkeeper_id == shopkeeper_id,
        Product.is_active == True,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
