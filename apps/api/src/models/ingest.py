from pydantic import BaseModel, Field


class IngestRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source: str = Field(..., description="e.g. 'resume' or 'context'")


class IngestResult(BaseModel):
    chunks_processed: int
    vectors_upserted: int
    source: str
