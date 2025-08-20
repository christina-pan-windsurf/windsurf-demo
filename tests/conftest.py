"""
pytest configuration and fixtures for Flask backend tests.

This module provides shared fixtures for testing the Flask application,
including test client setup and application context management.
"""

import pytest
from app import app

@pytest.fixture
def client():
    """
    Create a Flask test client for making HTTP requests in tests.
    
    Configures the app in testing mode and provides an application context
    for the duration of each test that uses this fixture.
    
    Yields:
        FlaskClient: A test client for making requests to the Flask app
    """
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

@pytest.fixture
def flask_app():
    """
    Provide the Flask application instance configured for testing.
    
    Returns:
        Flask: The Flask application instance with TESTING=True
    """
    app.config['TESTING'] = True
    return app
