# Testing Guide

## Overview
This document provides instructions for running and maintaining the Flask backend test suite.

## Quick Start

### Install Dependencies
```bash
pip3 install -r requirements.txt
```

### Run Tests
```bash
# Run all tests
pytest tests/

# Run with verbose output
pytest tests/ -v

# Run specific test file
pytest tests/test_app.py -v

# Run specific test
pytest tests/test_app.py::TestFlaskRoutes::test_index_route -v
```

### Generate Coverage Report
```bash
# Run tests with coverage
coverage run -m pytest tests/

# View coverage report
coverage report

# Generate HTML report
coverage html
```

## Test Structure

### Directory Layout
```
tests/
├── __init__.py          # Makes tests a Python package
├── conftest.py          # pytest fixtures and configuration
├── test_app.py          # Flask routes and configuration tests
└── test_helpers.py      # Utility function tests
```

### Test Categories

**Flask Routes (`test_app.py`):**
- HTTP endpoint testing
- Request/response validation
- Error handling
- Configuration constants

**Utility Functions (`test_helpers.py`):**
- Business logic testing
- Edge case validation
- Type checking
- Mathematical operations

## Coverage Goals

- **Target**: 100% code coverage on application code
- **Exclusions**: Test files, virtual environments, migrations
- **Focus**: Meaningful coverage over line coverage

## Troubleshooting

### Common Issues

**Import Errors:**
```bash
# Ensure you're in the project root
cd /path/to/project

# Check Python path
python3 -c "import sys; print(sys.path)"
```

**Flask App Not Found:**
```bash
# Verify Flask app structure
python3 -c "from app import app; print(app)"
```

**Coverage Not Working:**
```bash
# Check .coveragerc configuration
cat .coveragerc

# Run coverage with debug
coverage run --debug=trace -m pytest tests/
```
