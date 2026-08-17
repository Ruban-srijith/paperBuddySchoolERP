from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class FeePaymentCreate(BaseModel):
    title: str = Field("Term 1 Tuition & Operations Fee", json_schema_extra={"example": "Term 1 Tuition Fee"})
    amount: float = Field(..., json_schema_extra={"example": 450.00})
    payment_method: str = Field("Card", json_schema_extra={"example": "Card"}) # Card, UPI, Net Banking
    fee_structure_id: Optional[str] = Field(None)
    student_id: Optional[str] = Field(None)

class FeePaymentResponse(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    title: str
    amount: float
    payment_method: str
    transaction_id: str
    receipt_number: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RazorpayOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    fee_structure_id: Optional[str] = None
    student_id: Optional[str] = None

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key: str

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    title: str = Field("Term 1 Tuition & Operations Fee")
    amount: float
    payment_method: str = Field("Razorpay")
    fee_structure_id: Optional[str] = None
    student_id: Optional[str] = None

