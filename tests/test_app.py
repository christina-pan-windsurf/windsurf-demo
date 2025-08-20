import pytest
import json
from app import app, WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD

class TestFlaskRoutes:
    
    def test_index_route(self, client):
        response = client.get('/')
        assert response.status_code == 200
        assert 'text/html' in response.content_type
    
    def test_game_state_route(self, client):
        response = client.get('/game_state')
        assert response.status_code == 200
        assert 'application/json' in response.content_type
        
        data = response.get_json()
        assert data['status'] == 'ok'
    
    def test_update_player_route_post(self, client):
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player', 
                             json=test_data)
        assert response.status_code == 200
        assert 'application/json' in response.content_type
        
        data = response.get_json()
        assert data['status'] == 'ok'
    
    def test_update_player_route_get_not_allowed(self, client):
        response = client.get('/update_player')
        assert response.status_code == 405
    
    def test_update_player_route_empty_json(self, client):
        response = client.post('/update_player', json={})
        assert response.status_code == 200
        
        data = response.get_json()
        assert data['status'] == 'ok'
    
    def test_update_player_route_invalid_json(self, client):
        response = client.post('/update_player', 
                             data='invalid json',
                             content_type='application/json')
        assert response.status_code == 400

class TestConfigurationConstants:
    
    def test_world_size_constant(self):
        assert WORLD_SIZE == 2000
        assert isinstance(WORLD_SIZE, int)
    
    def test_num_ai_players_constant(self):
        assert NUM_AI_PLAYERS == 10
        assert isinstance(NUM_AI_PLAYERS, int)
    
    def test_num_food_constant(self):
        assert NUM_FOOD == 100
        assert isinstance(NUM_FOOD, int)
    
    def test_constants_are_positive(self):
        assert WORLD_SIZE > 0
        assert NUM_AI_PLAYERS > 0
        assert NUM_FOOD > 0
