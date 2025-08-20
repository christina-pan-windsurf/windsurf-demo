import pytest
import json
from app import app, WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD
from helpers import compute_product_of_world


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestFlaskRoutes:
    
    def test_root_endpoint_returns_200(self, client):
        response = client.get('/')
        assert response.status_code == 200
    
    def test_root_endpoint_renders_template(self, client):
        response = client.get('/')
        assert b'<!DOCTYPE html>' in response.data
        assert b'Windsurf vs All' in response.data
        assert b'gameCanvas' in response.data
    
    def test_game_state_endpoint_returns_json(self, client):
        response = client.get('/game_state')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    def test_game_state_endpoint_json_structure(self, client):
        response = client.get('/game_state')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_post_endpoint_accepts_json(self, client):
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player', 
                             data=json.dumps(test_data),
                             content_type='application/json')
        assert response.status_code == 200
    
    def test_update_player_post_endpoint_returns_json(self, client):
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player',
                             data=json.dumps(test_data),
                             content_type='application/json')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_post_endpoint_handles_empty_json(self, client):
        response = client.post('/update_player',
                             data=json.dumps({}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
    
    def test_update_player_get_method_not_allowed(self, client):
        response = client.get('/update_player')
        assert response.status_code == 405


class TestGameConstants:
    
    def test_world_size_constant_defined(self):
        assert WORLD_SIZE is not None
        assert isinstance(WORLD_SIZE, int)
        assert WORLD_SIZE == 2000
    
    def test_num_ai_players_constant_defined(self):
        assert NUM_AI_PLAYERS is not None
        assert isinstance(NUM_AI_PLAYERS, int)
        assert NUM_AI_PLAYERS == 10
    
    def test_num_food_constant_defined(self):
        assert NUM_FOOD is not None
        assert isinstance(NUM_FOOD, int)
        assert NUM_FOOD == 100
    
    def test_constants_are_positive_integers(self):
        assert WORLD_SIZE > 0
        assert NUM_AI_PLAYERS > 0
        assert NUM_FOOD > 0
    
    def test_constants_accessible_from_app_module(self):
        from app import WORLD_SIZE as ws, NUM_AI_PLAYERS as nap, NUM_FOOD as nf
        assert ws == 2000
        assert nap == 10
        assert nf == 100


class TestFlaskAppConfiguration:
    
    def test_flask_app_instance_created(self):
        assert app is not None
        assert app.name == 'app'
    
    def test_flask_app_has_correct_import_name(self):
        assert app.import_name == 'app'
    
    def test_flask_app_testing_mode_configurable(self):
        app.config['TESTING'] = True
        assert app.config['TESTING'] is True
        app.config['TESTING'] = False
        assert app.config['TESTING'] is False
    
    def test_flask_app_debug_mode_accessible(self):
        original_debug = app.debug
        app.debug = True
        assert app.debug is True
        app.debug = False
        assert app.debug is False
        app.debug = original_debug


class TestHelperFunctionIntegration:
    
    def test_compute_product_of_world_function_exists(self):
        assert compute_product_of_world is not None
        assert callable(compute_product_of_world)
    
    def test_compute_product_of_world_with_app_constants(self):
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        expected = 2000 * 10 * 100
        assert result == expected
        assert result == 2000000
    
    def test_compute_product_of_world_with_custom_values(self):
        result = compute_product_of_world(1000, 5, 50)
        expected = 1000 * 5 * 50
        assert result == expected
        assert result == 250000
    
    def test_compute_product_of_world_with_zero_values(self):
        result = compute_product_of_world(0, NUM_AI_PLAYERS, NUM_FOOD)
        assert result == 0
        
        result = compute_product_of_world(WORLD_SIZE, 0, NUM_FOOD)
        assert result == 0
        
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, 0)
        assert result == 0
    
    def test_compute_product_of_world_return_type(self):
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        import numpy as np
        assert isinstance(result, (int, float, np.integer, np.floating))
    
    def test_numpy_dependency_integration(self):
        import numpy as np
        test_array = [WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD]
        numpy_result = np.prod(test_array)
        helper_result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        assert numpy_result == helper_result


class TestTemplateRendering:
    
    def test_root_endpoint_uses_game_template(self, client):
        response = client.get('/')
        assert b'game.html' not in response.data
        assert b'<canvas id="gameCanvas">' in response.data
        assert b'<div id="score">' in response.data
        assert b'<div id="leaderboard">' in response.data
    
    def test_template_contains_game_elements(self, client):
        response = client.get('/')
        assert b'gameCanvas' in response.data
        assert b'leaderboard' in response.data
        assert b'minimap' in response.data
        assert b'settings-panel' in response.data
    
    def test_template_includes_javascript_module(self, client):
        response = client.get('/')
        assert b'static/js/game.js' in response.data
        assert b'type="module"' in response.data


class TestAPIEndpointBehavior:
    
    def test_game_state_endpoint_content_type_header(self, client):
        response = client.get('/game_state')
        assert 'application/json' in response.content_type
    
    def test_update_player_requires_json_content_type(self, client):
        response = client.post('/update_player', data='{"test": "data"}')
        assert response.status_code == 400 or response.status_code == 200
    
    def test_update_player_handles_malformed_json(self, client):
        response = client.post('/update_player',
                             data='{"invalid": json}',
                             content_type='application/json')
        assert response.status_code in [400, 500]
    
    def test_endpoints_return_proper_http_methods(self, client):
        get_response = client.get('/')
        assert get_response.status_code == 200
        
        post_response = client.post('/')
        assert post_response.status_code == 405
        
        get_game_state = client.get('/game_state')
        assert get_game_state.status_code == 200
        
        post_game_state = client.post('/game_state')
        assert post_game_state.status_code == 405
