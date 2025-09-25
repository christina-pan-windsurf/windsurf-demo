"""
Tests for Flask application routes and configuration constants.
This module contains comprehensive tests for all Flask endpoints,
HTTP methods, error handling, and application configuration.
"""

import pytest
import json
from app import app, WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD

class TestFlaskRoutes:
    """Test suite for Flask application routes and endpoints."""

    def test_index_route(self, client):
        """Test that the index route (/) returns the game HTML template."""
        response = client.get('/')
        assert response.status_code == 200
        assert 'text/html' in response.content_type

    def test_game_state_route(self, client):
        """Test that /game_state returns JSON with status 'ok'."""
        response = client.get('/game_state')
        assert response.status_code == 200
        assert 'application/json' in response.content_type

        data = response.get_json()
        assert data['status'] == 'ok'

    def test_update_player_route_post(self, client):
        """Test that /update_player accepts POST requests with JSON data."""
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player', json=test_data)
        assert response.status_code == 200
        assert 'application/json' in response.content_type

        data = response.get_json()
        assert data['status'] == 'ok'

    def test_update_player_route_get_not_allowed(self, client):
        """Test that /update_player rejects GET requests with 405 Method Not Allowed."""
        response = client.get('/update_player')
        assert response.status_code == 405

    def test_update_player_route_empty_json(self, client):
        """Test that /update_player handles empty JSON payload gracefully."""
        response = client.post('/update_player', json={})
        assert response.status_code == 200

        data = response.get_json()
        assert data['status'] == 'ok'

    def test_update_player_route_invalid_json(self, client):
        """Test that /update_player returns 400 for malformed JSON."""
        response = client.post('/update_player', 
                             data='invalid json',
                             content_type='application/json')
        assert response.status_code == 400

class TestConfigurationConstants:
    """Test suite for Flask application configuration constants."""

    def test_world_size_constant(self):
        """Test that WORLD_SIZE is set to expected value and is an integer."""
        assert WORLD_SIZE == 2000
        assert isinstance(WORLD_SIZE, int)

    def test_num_ai_players_constant(self):
        """Test that NUM_AI_PLAYERS is set to expected value and is an integer."""
        assert NUM_AI_PLAYERS == 10
        assert isinstance(NUM_AI_PLAYERS, int)

    def test_num_food_constant(self):
        """Test that NUM_FOOD is set to expected value and is an integer."""
        assert NUM_FOOD == 100
        assert isinstance(NUM_FOOD, int)

    def test_constants_are_positive(self):
        """Test that all configuration constants have positive values."""
        assert WORLD_SIZE > 0
        assert NUM_AI_PLAYERS > 0
        assert NUM_FOOD > 0
