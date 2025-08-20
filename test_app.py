"""
Comprehensive test suite for Flask backend (app.py) covering:
- HTTP route testing for all endpoints
- Game constants validation 
- Flask app configuration testing
- Helper function integration with NumPy
- Template rendering verification
- API endpoint behavior validation

This test suite ensures the Flask backend works correctly for the Agar.io-style game,
testing both the web interface and API endpoints used for multiplayer functionality.
"""

import pytest
import json
from app import app, WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD
from helpers import compute_product_of_world


@pytest.fixture
def client():
    """
    Create a Flask test client for HTTP endpoint testing.
    
    Sets the app to testing mode to disable error catching during request handling,
    allowing exceptions to propagate and be caught by the test framework.
    """
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestFlaskRoutes:
    """
    Test all Flask HTTP endpoints to ensure proper request handling and responses.
    
    Covers the three main endpoints:
    - / (root): Serves the game template
    - /game_state: Returns JSON game state data
    - /update_player: Handles POST requests with player data
    """
    
    def test_root_endpoint_returns_200(self, client):
        """Test that the root endpoint returns a successful HTTP 200 response."""
        response = client.get('/')
        assert response.status_code == 200
    
    def test_root_endpoint_renders_template(self, client):
        """
        Test that the root endpoint properly renders the game.html template.
        
        Verifies that the response contains expected HTML elements:
        - DOCTYPE declaration for valid HTML
        - Game title "Windsurf vs All"
        - Game canvas element for rendering the game
        """
        response = client.get('/')
        assert b'<!DOCTYPE html>' in response.data
        assert b'Windsurf vs All' in response.data
        assert b'gameCanvas' in response.data
    
    def test_game_state_endpoint_returns_json(self, client):
        """
        Test that /game_state endpoint returns JSON with correct content type.
        
        This endpoint is designed for future multiplayer functionality to provide
        real-time game state updates to connected clients.
        """
        response = client.get('/game_state')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    def test_game_state_endpoint_json_structure(self, client):
        """
        Test that /game_state returns properly structured JSON response.
        
        Validates the JSON contains required fields with expected values
        for client-side game state synchronization.
        """
        response = client.get('/game_state')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_post_endpoint_accepts_json(self, client):
        """
        Test that /update_player accepts POST requests with JSON player data.
        
        Simulates a client sending player position and score updates,
        which would be used in multiplayer mode for real-time synchronization.
        """
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player', 
                             data=json.dumps(test_data),
                             content_type='application/json')
        assert response.status_code == 200
    
    def test_update_player_post_endpoint_returns_json(self, client):
        """
        Test that /update_player returns proper JSON response after processing data.
        
        Ensures the server acknowledges player updates with a structured response
        that clients can use to confirm successful data transmission.
        """
        test_data = {'x': 100, 'y': 200, 'score': 50}
        response = client.post('/update_player',
                             data=json.dumps(test_data),
                             content_type='application/json')
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'ok'
    
    def test_update_player_post_endpoint_handles_empty_json(self, client):
        """
        Test that /update_player gracefully handles empty JSON payloads.
        
        This edge case ensures the server doesn't crash when clients send
        malformed or incomplete player data updates.
        """
        response = client.post('/update_player',
                             data=json.dumps({}),
                             content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'ok'
    
    def test_update_player_get_method_not_allowed(self, client):
        """
        Test that /update_player properly rejects GET requests.
        
        This endpoint should only accept POST requests with player data,
        so GET requests should return HTTP 405 Method Not Allowed.
        """
        response = client.get('/update_player')
        assert response.status_code == 405


class TestGameConstants:
    """
    Test game configuration constants that define the game world parameters.
    
    These constants are critical for game balance and must be properly defined:
    - WORLD_SIZE: Defines the game world boundaries (2000x2000 pixels)
    - NUM_AI_PLAYERS: Number of computer-controlled players (10)
    - NUM_FOOD: Number of food particles spawned in the world (100)
    """
    
    def test_world_size_constant_defined(self):
        """
        Test that WORLD_SIZE constant is properly defined with correct value.
        
        WORLD_SIZE determines the game world boundaries and affects:
        - Player movement limits
        - Food spawn locations
        - Camera viewport calculations
        """
        assert WORLD_SIZE is not None
        assert isinstance(WORLD_SIZE, int)
        assert WORLD_SIZE == 2000
    
    def test_num_ai_players_constant_defined(self):
        """
        Test that NUM_AI_PLAYERS constant is properly defined.
        
        This controls the number of AI-controlled players in the game,
        affecting game difficulty and server performance.
        """
        assert NUM_AI_PLAYERS is not None
        assert isinstance(NUM_AI_PLAYERS, int)
        assert NUM_AI_PLAYERS == 10
    
    def test_num_food_constant_defined(self):
        """
        Test that NUM_FOOD constant is properly defined.
        
        This determines how many food particles are available for players
        to consume, affecting game progression and player growth rate.
        """
        assert NUM_FOOD is not None
        assert isinstance(NUM_FOOD, int)
        assert NUM_FOOD == 100
    
    def test_constants_are_positive_integers(self):
        """
        Test that all game constants are positive integers.
        
        Negative or zero values would break game logic:
        - Zero world size would prevent player movement
        - Zero AI players would make the game too easy
        - Zero food would prevent player growth
        """
        assert WORLD_SIZE > 0
        assert NUM_AI_PLAYERS > 0
        assert NUM_FOOD > 0
    
    def test_constants_accessible_from_app_module(self):
        """
        Test that constants can be imported directly from the app module.
        
        This ensures other modules (like helpers.py) can access these
        constants for calculations and game logic integration.
        """
        from app import WORLD_SIZE as ws, NUM_AI_PLAYERS as nap, NUM_FOOD as nf
        assert ws == 2000
        assert nap == 10
        assert nf == 100


class TestFlaskAppConfiguration:
    """
    Test Flask application initialization and configuration settings.
    
    Ensures the Flask app is properly configured for both development
    and production environments, with correct debugging and testing modes.
    """
    
    def test_flask_app_instance_created(self):
        """
        Test that Flask application instance is properly created.
        
        Verifies the app object exists and has the correct name,
        which is essential for Flask's routing and request handling.
        """
        assert app is not None
        assert app.name == 'app'
    
    def test_flask_app_has_correct_import_name(self):
        """
        Test that Flask app has the correct import name.
        
        The import name is used by Flask to locate resources like
        templates and static files relative to the application module.
        """
        assert app.import_name == 'app'
    
    def test_flask_app_testing_mode_configurable(self):
        """
        Test that Flask testing mode can be enabled and disabled.
        
        Testing mode disables error catching during request handling,
        allowing exceptions to propagate for better test debugging.
        This is crucial for the test suite to work properly.
        """
        app.config['TESTING'] = True
        assert app.config['TESTING'] is True
        app.config['TESTING'] = False
        assert app.config['TESTING'] is False
    
    def test_flask_app_debug_mode_accessible(self):
        """
        Test that Flask debug mode can be controlled programmatically.
        
        Debug mode enables:
        - Automatic reloading on code changes
        - Interactive debugger for exceptions
        - Detailed error pages
        
        This test ensures debug mode can be toggled for different environments.
        """
        original_debug = app.debug
        app.debug = True
        assert app.debug is True
        app.debug = False
        assert app.debug is False
        app.debug = original_debug


class TestHelperFunctionIntegration:
    """
    Test integration between Flask app and helper functions from helpers.py.
    
    Focuses on the compute_product_of_world function which demonstrates:
    - Integration with NumPy for mathematical operations
    - Usage of Flask app constants in helper calculations
    - Proper handling of edge cases and data types
    """
    
    def test_compute_product_of_world_function_exists(self):
        """
        Test that the compute_product_of_world function is properly imported and callable.
        
        This basic test ensures the helper module integration works and
        the function is available for use by the Flask application.
        """
        assert compute_product_of_world is not None
        assert callable(compute_product_of_world)
    
    def test_compute_product_of_world_with_app_constants(self):
        """
        Test compute_product_of_world function using actual Flask app constants.
        
        This integration test verifies that:
        - Helper functions can access Flask app constants
        - Mathematical calculations produce expected results
        - The function works with real game configuration values
        
        Expected calculation: 2000 * 10 * 100 = 2,000,000
        """
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        expected = 2000 * 10 * 100
        assert result == expected
        assert result == 2000000
    
    def test_compute_product_of_world_with_custom_values(self):
        """
        Test compute_product_of_world function with custom test values.
        
        This ensures the function works correctly with different inputs
        beyond the default game constants, which is important for:
        - Testing different game configurations
        - Validating mathematical correctness
        - Ensuring function flexibility
        """
        result = compute_product_of_world(1000, 5, 50)
        expected = 1000 * 5 * 50
        assert result == expected
        assert result == 250000
    
    def test_compute_product_of_world_with_zero_values(self):
        """
        Test compute_product_of_world function handles zero values correctly.
        
        Edge case testing ensures the function behaves predictably when:
        - World size is zero (invalid game state)
        - No AI players are present
        - No food is available
        
        Any zero input should result in zero output (mathematical property).
        """
        result = compute_product_of_world(0, NUM_AI_PLAYERS, NUM_FOOD)
        assert result == 0
        
        result = compute_product_of_world(WORLD_SIZE, 0, NUM_FOOD)
        assert result == 0
        
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, 0)
        assert result == 0
    
    def test_compute_product_of_world_return_type(self):
        """
        Test that compute_product_of_world returns appropriate numeric type.
        
        The function uses NumPy internally, so it may return numpy numeric types
        instead of Python built-in types. This test ensures compatibility with
        both Python and NumPy numeric types for flexible usage.
        """
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        import numpy as np
        assert isinstance(result, (int, float, np.integer, np.floating))
    
    def test_numpy_dependency_integration(self):
        """
        Test that NumPy integration works correctly in helper functions.
        
        This test verifies:
        - NumPy is properly imported and functional
        - Helper function produces same results as direct NumPy calls
        - Mathematical consistency between different calculation methods
        
        This ensures the NumPy dependency is working correctly and
        the helper function is implemented properly.
        """
        import numpy as np
        test_array = [WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD]
        numpy_result = np.prod(test_array)
        helper_result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        assert numpy_result == helper_result


class TestTemplateRendering:
    """
    Test Flask template rendering for the game interface.
    
    Verifies that the game.html template is properly rendered with all
    necessary HTML elements for the Agar.io-style game interface.
    """
    
    def test_root_endpoint_uses_game_template(self, client):
        """
        Test that the root endpoint renders the game template with core UI elements.
        
        Verifies the presence of essential game interface components:
        - Game canvas for rendering the game world
        - Score display for player feedback
        - Leaderboard for competitive elements
        
        Note: The template name itself shouldn't appear in rendered HTML.
        """
        response = client.get('/')
        assert b'game.html' not in response.data
        assert b'<canvas id="gameCanvas">' in response.data
        assert b'<div id="score">' in response.data
        assert b'<div id="leaderboard">' in response.data
    
    def test_template_contains_game_elements(self, client):
        """
        Test that the template includes all necessary game interface elements.
        
        Validates the presence of key UI components:
        - gameCanvas: Main game rendering area
        - leaderboard: Shows top players
        - minimap: Provides world overview
        - settings-panel: Game configuration options
        
        These elements are essential for the game's user experience.
        """
        response = client.get('/')
        assert b'gameCanvas' in response.data
        assert b'leaderboard' in response.data
        assert b'minimap' in response.data
        assert b'settings-panel' in response.data
    
    def test_template_includes_javascript_module(self, client):
        """
        Test that the template properly includes the game JavaScript module.
        
        Verifies:
        - The main game.js file is referenced
        - JavaScript is loaded as an ES6 module (type="module")
        
        This is crucial for the client-side game logic to function properly.
        """
        response = client.get('/')
        assert b'static/js/game.js' in response.data
        assert b'type="module"' in response.data


class TestAPIEndpointBehavior:
    """
    Test API endpoint behavior for proper HTTP protocol compliance.
    
    Validates that endpoints handle different HTTP methods correctly,
    return appropriate content types, and handle error conditions gracefully.
    This is important for API reliability and client integration.
    """
    
    def test_game_state_endpoint_content_type_header(self, client):
        """
        Test that /game_state endpoint returns correct Content-Type header.
        
        API endpoints should explicitly declare their content type so clients
        can properly parse responses. JSON endpoints must return
        'application/json' content type for proper client handling.
        """
        response = client.get('/game_state')
        assert 'application/json' in response.content_type
    
    def test_update_player_requires_json_content_type(self, client):
        """
        Test /update_player endpoint behavior with missing Content-Type header.
        
        When clients send data without proper Content-Type headers,
        the server should either:
        - Return 400 Bad Request (strict validation)
        - Accept and process the data (lenient handling)
        
        Both behaviors are acceptable depending on implementation.
        """
        response = client.post('/update_player', data='{"test": "data"}')
        assert response.status_code == 400 or response.status_code == 200
    
    def test_update_player_handles_malformed_json(self, client):
        """
        Test /update_player endpoint handles malformed JSON gracefully.
        
        When clients send invalid JSON data, the server should return
        an appropriate error status:
        - 400 Bad Request: Client error, invalid JSON syntax
        - 500 Internal Server Error: Server parsing error
        
        The server should not crash or return unexpected responses.
        """
        response = client.post('/update_player',
                             data='{"invalid": json}',  # Missing quotes around 'json'
                             content_type='application/json')
        assert response.status_code in [400, 500]
    
    def test_endpoints_return_proper_http_methods(self, client):
        """
        Test that endpoints properly handle allowed and disallowed HTTP methods.
        
        Validates HTTP method restrictions:
        - GET /: Should work (serves game page)
        - POST /: Should return 405 Method Not Allowed
        - GET /game_state: Should work (returns game data)
        - POST /game_state: Should return 405 Method Not Allowed
        
        Proper HTTP method handling is essential for RESTful API design.
        """
        get_response = client.get('/')
        assert get_response.status_code == 200
        
        post_response = client.post('/')
        assert post_response.status_code == 405
        
        get_game_state = client.get('/game_state')
        assert get_game_state.status_code == 200
        
        post_game_state = client.post('/game_state')
        assert post_game_state.status_code == 405
