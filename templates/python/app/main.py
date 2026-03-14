from fastapi import FastAPI

app = FastAPI(title="{{PROJECT_NAME}}")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
