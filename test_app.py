import pytest
import json
from app import app, WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD
from helpers import compute_product_of_world


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestFlaskRoutes:
    """Test suite for Flask application routes."""
    
    def test_index_route_returns_200(self, client):
        """Test that the index route returns a successful response."""
        response = client.get('/')
        assert response.status_code == 200
        assert b'text/html' in response.content_type.encode()
    
    def test_index_route_renders_template(self, client):
        """Test that the index route renders the game.html template."""
        response = client.get('/')
        assert b'Windsurf vs All' in response.data
        assert b'gameCanvas' in response.data
        assert b'leaderboard' in response.data
    
    def test_game_state_route_returns_200(self, client):
        """Test that the game_state route returns a successful response."""
        response = client.get('/game_state')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    def test_game_state_route_returns_valid_json(self, client):
        """Test that the game_state route returns valid JSON structure."""
        response = client.get('/game_state')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_route_accepts_post(self, client):
        """Test that the update_player route accepts POST requests."""
        response = client.post('/update_player', 
                             json={'x': 100, 'y': 200, 'score': 50})
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    def test_update_player_route_returns_valid_json(self, client):
        """Test that the update_player route returns valid JSON response."""
        response = client.post('/update_player', 
                             json={'x': 100, 'y': 200, 'score': 50})
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_route_handles_empty_payload(self, client):
        """Test that the update_player route handles empty JSON payload."""
        response = client.post('/update_player', json={})
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
    
    def test_update_player_route_handles_no_json(self, client):
        """Test that the update_player route handles requests without JSON."""
        response = client.post('/update_player')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
    
    def test_update_player_route_rejects_get(self, client):
        """Test that the update_player route rejects GET requests."""
        response = client.get('/update_player')
        assert response.status_code == 405


class TestGameConstants:
    """Test suite for game configuration constants."""
    
    def test_world_size_constant(self):
        """Test that WORLD_SIZE constant has expected value."""
        assert WORLD_SIZE == 2000
        assert isinstance(WORLD_SIZE, int)
    
    def test_num_ai_players_constant(self):
        """Test that NUM_AI_PLAYERS constant has expected value."""
        assert NUM_AI_PLAYERS == 10
        assert isinstance(NUM_AI_PLAYERS, int)
    
    def test_num_food_constant(self):
        """Test that NUM_FOOD constant has expected value."""
        assert NUM_FOOD == 100
        assert isinstance(NUM_FOOD, int)


class TestHelperFunctions:
    """Test suite for helper functions."""
    
    def test_compute_product_of_world_with_game_constants(self):
        """Test compute_product_of_world function with actual game constants."""
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        expected = 2000 * 10 * 100
        assert result == expected
    
    def test_compute_product_of_world_with_custom_values(self):
        """Test compute_product_of_world function with custom values."""
        result = compute_product_of_world(100, 5, 20)
        expected = 100 * 5 * 20
        assert result == expected
    
    def test_compute_product_of_world_with_zeros(self):
        """Test compute_product_of_world function with zero values."""
        result = compute_product_of_world(0, 10, 100)
        assert result == 0
    
    def test_compute_product_of_world_return_type(self):
        """Test that compute_product_of_world returns correct type."""
        result = compute_product_of_world(10, 10, 10)
        assert isinstance(result, (int, float)) or hasattr(result, 'item')
