import pytest
import numpy as np
from helpers import compute_product_of_world

class TestComputeProductOfWorld:
    
    def test_basic_computation(self):
        result = compute_product_of_world(2000, 10, 100)
        expected = 2000 * 10 * 100
        assert result == expected
        assert result == 2000000
    
    def test_with_default_constants(self):
        from app import WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD
        result = compute_product_of_world(WORLD_SIZE, NUM_AI_PLAYERS, NUM_FOOD)
        expected = WORLD_SIZE * NUM_AI_PLAYERS * NUM_FOOD
        assert result == expected
        assert result == 2000000
    
    def test_with_small_values(self):
        result = compute_product_of_world(10, 2, 5)
        assert result == 100
    
    def test_with_large_values(self):
        result = compute_product_of_world(10000, 50, 500)
        expected = 10000 * 50 * 500
        assert result == expected
        assert result == 250000000
    
    def test_with_zero_world_size(self):
        result = compute_product_of_world(0, 10, 100)
        assert result == 0
    
    def test_with_zero_ai_players(self):
        result = compute_product_of_world(2000, 0, 100)
        assert result == 0
    
    def test_with_zero_food(self):
        result = compute_product_of_world(2000, 10, 0)
        assert result == 0
    
    def test_with_all_zeros(self):
        result = compute_product_of_world(0, 0, 0)
        assert result == 0
    
    def test_with_ones(self):
        result = compute_product_of_world(1, 1, 1)
        assert result == 1
    
    def test_return_type_is_numpy_type(self):
        result = compute_product_of_world(10, 5, 2)
        assert isinstance(result, (int, np.integer))
    
    def test_parameter_types_accepted(self):
        result_int = compute_product_of_world(10, 5, 2)
        result_float = compute_product_of_world(10.0, 5.0, 2.0)
        assert result_int == result_float
        assert result_int == 100
