from pydantic import BaseModel


class LoginRequest(BaseModel):
    phone: str
    verificationCode: str


class LoginResponse(BaseModel):
    accessToken: str
    expiresIn: int
    userId: str


class VerifyIdResponse(BaseModel):
    verified: bool
    extractedName: str
    registrationNumber: str
    visaType: str
    visaExpiryDate: str


class VerifyPhoneRequest(BaseModel):
    phone: str
    carrier: str


class VerifyPhoneResponse(BaseModel):
    sent: bool
    expiresInSec: int
