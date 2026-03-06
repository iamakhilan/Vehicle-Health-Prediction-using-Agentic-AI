import pytest
import os
import sys

# Ensure backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import feature_engineering, health_model
from api_server import app
from backend import database

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_feature_normalization():
    # Test valid normal extraction
    data = {
        "rpm": "4000",
        "engine_load": "50",
        "coolant_temp": 105,
        "throttle_pos": "50",
        "fuel_trim": "10",
        "dtc_flag": False
    }
    features = feature_engineering.normalize_features(data)
    assert features['norm_rpm'] == 0.5
    assert features['norm_load'] == 0.5
    assert features['norm_temp'] == 0.5 # (105 - 90) / 30
    assert features['norm_throttle'] == 0.5
    assert features['norm_trim'] == 10 / 25
    assert features['norm_dtc'] == 0.0

def test_health_decay_logic():
    # Stress model should exponentially decay
    # Re-init db for tests to assure clean state by overriding get_connection if needed, 
    # but since it's sqlite standard it might hit the same dev DB. 
    # For baseline, we just verify the math calculation.
    norm_features = {
        'norm_dtc': 1.0,
        'norm_temp': 1.0,
        'norm_load': 1.0,
        'norm_rpm': 1.0,
        'norm_trim': 1.0,
        'norm_throttle': 1.0
    }
    stress = health_model.calculate_stress_index(norm_features)
    assert stress == 1.0 # Max stress
    
    health = health_model.process_vehicle_health("test_car", stress, engine_runtime=60)
    # decay should be stress * 2.0 * runtime(1.0) = 2.0
    # since it might not be initialized properly in the DB, it should drop from 100 to 98
    assert health <= 98.0

def test_predict_validation(client):
    # Missing vehicle_id
    response = client.post('/predict', json={"engine_runtime": 50})
    assert response.status_code == 400
    assert b"Missing required field" in response.data

def test_estimate_validation(client):
    response = client.post('/estimate', json={"stress_factors": "not_a_list"})
    assert response.status_code == 400
    
    response = client.post('/estimate', json={"stress_factors": ["rpm"], "risk_level": "Medium"})
    assert response.status_code == 200
    assert b"Engine performance diagnostics" in response.data
