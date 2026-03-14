# {{PROJECT_NAME}}

REST API with Python and FastAPI.

## Tech Stack

- Python 3.11+
- FastAPI
- Pydantic v2
- pytest + httpx (testing)
- Black + isort + ruff (formatting/linting)
- mypy (type checking)

## Setup

```bash
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

## Commands

| Command        | Description   |
| -------------- | ------------- |
| `pytest`       | Run tests     |
| `black .`      | Format code   |
| `isort .`      | Sort imports  |
| `ruff check .` | Lint code     |
| `mypy .`       | Type checking |

## API Endpoints

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

## Project Structure

```
app/
├── __init__.py
└── main.py        # FastAPI app & routes
tests/
├── __init__.py
└── test_health.py # Health endpoint test
```

Add directories as needed: `app/api/`, `app/models/`, `app/schemas/`, `app/services/`.
