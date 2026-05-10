from enum import Enum

from pydantic import BaseModel, Field


class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    role: ChatRole
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


class ChatResponse(BaseModel):
    answer: str
    chunks_used: int


class RateLimitError(BaseModel):
    error: str = "rate_limit_exceeded"
    retry_after: int
