# Flask Backend Testing Guide

This document explains how to run the test suite for the Flask backend of the Windsurf Demo Agar.io clone.

## Prerequisites

Make sure you have installed all dependencies:
```bash
pip3 install -r requirements.txt
```

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Tests with Verbose Output
```bash
pytest -v
```

### Run Specific Test Classes
```bash
# Test only Flask routes
pytest test_app.py::TestFlaskRoutes -v

# Test only game constants
pytest test_app.py::TestGameConstants -v

# Test only helper functions
pytest test_app.py::TestHelperFunctions -v
```

### Run Specific Test Methods
```bash
pytest test_app.py::TestFlaskRoutes::test_index_route_returns_200 -v
```

## Test Coverage

The test suite covers:

### Flask Routes
- **GET /** - Tests that the index route returns 200 status and renders the game template
- **GET /game_state** - Tests JSON response structure and status codes
- **POST /update_player** - Tests POST request handling with various payloads
- **Method validation** - Tests that routes reject inappropriate HTTP methods

### Game Constants
- **WORLD_SIZE** - Validates value (2000) and type
- **NUM_AI_PLAYERS** - Validates value (10) and type  
- **NUM_FOOD** - Validates value (100) and type

### Helper Functions
- **compute_product_of_world()** - Tests mathematical operations with game constants and custom values
- **Edge cases** - Tests behavior with zero values and validates return types

## Expected Test Results

All tests should pass. If any tests fail, check:
1. Flask application is properly configured
2. All dependencies are installed
3. Templates directory contains game.html
4. Helper functions have proper numpy imports
