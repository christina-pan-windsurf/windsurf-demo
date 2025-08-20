# Testing Documentation

## Flask Backend Test Suite

This project includes comprehensive test coverage for the Flask backend using pytest and Flask-Testing.

## Test Structure

```
tests/
├── conftest.py          # pytest fixtures and configuration
├── test_app.py          # Test Flask routes and application
└── test_helpers.py      # Test utility functions
```

## Running Tests

### Install Dependencies

```bash
pip3 install -r requirements.txt
```

### Run All Tests

```bash
pytest tests/
```

### Run Tests with Verbose Output

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_app.py
pytest tests/test_helpers.py
```

### Run Specific Test Class or Method

```bash
pytest tests/test_app.py::TestFlaskRoutes::test_index_route
pytest tests/test_helpers.py::TestComputeProductOfWorld
```

## Test Coverage

### Generate Coverage Report

```bash
coverage run -m pytest tests/
coverage report
```

### Generate HTML Coverage Report

```bash
coverage run -m pytest tests/
coverage html
```

The HTML report will be generated in `htmlcov/` directory. Open `htmlcov/index.html` in your browser to view detailed coverage information.

### Coverage Configuration

Coverage settings are configured in `.coveragerc` file:
- Source code is measured from the current directory
- Test files, virtual environments, and static assets are excluded
- Common boilerplate code patterns are excluded from coverage requirements

## Test Coverage Areas

### Flask Routes (`test_app.py`)
- `GET /` - Index route rendering
- `GET /game_state` - JSON game state endpoint
- `POST /update_player` - Player update endpoint with JSON data
- HTTP method validation (405 errors for incorrect methods)
- JSON parsing and error handling
- Configuration constants validation

### Utility Functions (`test_helpers.py`)
- `compute_product_of_world()` function with various parameter combinations
- Edge cases: zero values, large numbers, type handling
- Integration with application constants
- Return type validation

### Configuration Constants
- `WORLD_SIZE`, `NUM_AI_PLAYERS`, `NUM_FOOD` values and types
- Positive value validation

## Test Fixtures

### `client` fixture
Provides a Flask test client with testing configuration enabled and CSRF protection disabled for easier testing.

### `app_context` fixture
Provides Flask application context for tests that need to access application-level functionality.

## Expected Test Results

All tests should pass when run against the current Flask application. The test suite covers:
- HTTP endpoint functionality
- JSON response validation
- Error handling for invalid requests
- Utility function calculations
- Configuration constant validation
- Edge cases and boundary conditions

## Troubleshooting

### Import Errors
Ensure you're running tests from the project root directory and all dependencies are installed.

### Coverage Issues
If coverage reports show unexpected results, check the `.coveragerc` configuration and ensure you're running coverage from the project root.

### Flask App Issues
If Flask routes fail, verify that `app.py` is importable and the Flask application starts correctly with `python3 app.py`.
