import pytest
import os
import sys
import tempfile

# Ensure backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import feature_engineering, health_model
from backend import database
from backend import explanation_engine


@pytest.fixture(autouse=True)
def isolate_db(tmp_path):
    """Use a temporary database for each test to avoid polluting production data."""
    test_db = tmp_path / "test_vehicle_health.db"
    database.set_db_path(test_db)
    database.init_db()
    yield
    database.reset_db_path()


@pytest.fixture
def client():
    from api_server import app
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
    # since it starts from 100 in a fresh DB, it should drop to 98
    assert health <= 98.0

def test_predict_validation(client):
    # Missing vehicle_id
    response = client.post('/predict', json={"engine_runtime": 50})
    assert response.status_code == 400
    assert b"Missing required field" in response.data

    # Missing ML fields
    response = client.post('/predict', json={"vehicle_id": "test_car", "engine_runtime": 50})
    assert response.status_code == 400
    assert b"Missing required field" in response.data

def test_estimate_validation(client):
    response = client.post('/estimate', json={"stress_factors": "not_a_list"})
    assert response.status_code == 400
    
    response = client.post('/estimate', json={"stress_factors": ["rpm"], "risk_level": "Medium"})
    assert response.status_code == 200
    assert b"Engine performance diagnostics" in response.data


# --- New comprehensive tests ---

def test_feature_normalization_edge_cases():
    """Test boundary conditions in feature normalization."""
    # All zeros
    data = {"rpm": 0, "engine_load": 0, "coolant_temp": 0, "throttle_pos": 0, "fuel_trim": 0, "dtc_flag": False}
    features = feature_engineering.normalize_features(data)
    assert features['norm_rpm'] == 0.0
    assert features['norm_load'] == 0.0
    assert features['norm_temp'] == 0.0  # below 90 = 0
    assert features['norm_throttle'] == 0.0
    assert features['norm_trim'] == 0.0
    assert features['norm_dtc'] == 0.0

    # All maxed out
    data = {"rpm": 8000, "engine_load": 100, "coolant_temp": 120, "throttle_pos": 100, "fuel_trim": 25, "dtc_flag": True}
    features = feature_engineering.normalize_features(data)
    assert features['norm_rpm'] == 1.0
    assert features['norm_load'] == 1.0
    assert features['norm_temp'] == 1.0
    assert features['norm_throttle'] == 1.0
    assert features['norm_trim'] == 1.0
    assert features['norm_dtc'] == 1.0


def test_stress_index_zero_when_all_normal():
    """Zero-stress input should produce zero stress index."""
    norm_features = {
        'norm_dtc': 0.0, 'norm_temp': 0.0, 'norm_load': 0.0,
        'norm_rpm': 0.0, 'norm_trim': 0.0, 'norm_throttle': 0.0
    }
    stress = health_model.calculate_stress_index(norm_features)
    assert stress == 0.0


def test_stress_index_clamped():
    """Stress index should be clamped between 0 and 1."""
    norm_features = {
        'norm_dtc': 2.0, 'norm_temp': 2.0, 'norm_load': 2.0,
        'norm_rpm': 2.0, 'norm_trim': 2.0, 'norm_throttle': 2.0
    }
    stress = health_model.calculate_stress_index(norm_features)
    assert stress == 1.0


def test_risk_level_determination():
    """Risk levels should have consistent casing."""
    assert health_model.determine_risk_level(90) == "Low"
    assert health_model.determine_risk_level(80) == "Low"
    assert health_model.determine_risk_level(79) == "Medium"
    assert health_model.determine_risk_level(50) == "Medium"
    assert health_model.determine_risk_level(49) == "High"
    assert health_model.determine_risk_level(0) == "High"


def test_trend_analysis_stable_by_default():
    """Trend should be Stable for new vehicle with no history."""
    trend = health_model.analyze_trend("nonexistent_vehicle")
    assert trend == "Stable"


def test_remaining_distance_positive():
    """Remaining distance should always be >= 0."""
    dist = health_model.estimate_remaining_distance("unknown_vehicle", 50.0)
    assert dist >= 0
    dist = health_model.estimate_remaining_distance("unknown_vehicle", 0.0)
    assert dist == 0


def test_health_check_endpoint(client):
    """Health check should return ready status."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ready'


def test_predict_requires_json(client):
    """Predict endpoint should reject non-JSON requests."""
    response = client.post('/predict', data="not json", content_type='text/plain')
    assert response.status_code == 400
    assert b"JSON" in response.data


def test_predict_rejects_empty_fields(client):
    """Predict endpoint should reject empty string fields."""
    response = client.post('/predict', json={
        "vehicle_id": "test",
        "rpm": "",
        "oil_pressure": 3.5,
        "fuel_pressure": 7.0,
        "coolant_pressure": 2.0,
        "oil_temp": 77,
        "coolant_temperature": 75
    })
    assert response.status_code == 400


def test_predict_rejects_negative_runtime(client):
    """Predict endpoint should reject negative engine_runtime."""
    response = client.post('/predict', json={
        "vehicle_id": "test",
        "engine_runtime": -10,
        "rpm": 800,
        "oil_pressure": 3.5,
        "fuel_pressure": 7.0,
        "coolant_pressure": 2.0,
        "oil_temp": 77,
        "coolant_temperature": 75
    })
    assert response.status_code == 400
    assert b"engine_runtime" in response.data


def test_predict_returns_consistent_contract(client):
    """Predict endpoint should return all expected fields with consistent types."""
    response = client.post('/predict', json={
        "vehicle_id": "contract_test",
        "engine_runtime": 60,
        "rpm": 2000,
        "oil_pressure": 3.5,
        "fuel_pressure": 7.0,
        "coolant_pressure": 2.0,
        "oil_temp": 77,
        "coolant_temperature": 75
    })
    assert response.status_code == 200
    data = response.get_json()
    
    # Verify all required fields exist
    assert 'vehicle_id' in data
    assert 'health_score' in data
    assert 'risk_level' in data
    assert 'trend' in data
    assert 'failure_probability' in data
    assert 'explanation' in data
    assert 'primary_stress_factors' in data
    assert 'input_features' in data
    
    # Verify risk_level uses consistent casing
    assert data['risk_level'] in ('Low', 'Medium', 'High')
    
    # Verify trend uses consistent casing
    assert data['trend'] in ('Stable', 'Degrading', 'Improving')
    
    # Verify types
    assert isinstance(data['health_score'], (int, float))
    assert isinstance(data['failure_probability'], (int, float))
    assert isinstance(data['primary_stress_factors'], list)
    assert 0 <= data['failure_probability'] <= 1
    assert 0 <= data['health_score'] <= 100


def test_estimate_default_fallback(client):
    """Estimate should return a default when no rules match."""
    response = client.post('/estimate', json={
        "stress_factors": ["nonexistent_sensor"],
        "risk_level": "Low"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['action'] == "Routine inspection recommended"


def test_estimate_matches_api_key_factors(client):
    """Estimate should match when stress_factors use API field names."""
    response = client.post('/estimate', json={
        "stress_factors": ["coolant_temperature"],
        "risk_level": "High"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['action'] == "Cooling system service"


def test_schedule_returns_valid_slot(client):
    """Schedule endpoint should return a valid slot."""
    response = client.post('/schedule',
        data='{}',
        content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert 'next_slot' in data
    assert 'location' in data
    assert data['location'] == "Downtown Service Center"


def test_vehicle_history_empty(client):
    """History should return empty list for unknown vehicle."""
    response = client.get('/vehicle-history/unknown_vehicle')
    assert response.status_code == 200
    data = response.get_json()
    assert data == []


def test_vehicle_history_limit_validation(client):
    """History limit must be an integer."""
    response = client.get('/vehicle-history/test_car?limit=abc')
    assert response.status_code == 400
    assert b"integer" in response.data


def test_simulated_data_endpoint(client):
    """Simulated data endpoint should return telemetry."""
    response = client.get('/simulated-data?index=0')
    # May return 503 if dataset is empty in test env, or 200 if available
    assert response.status_code in (200, 503)
    if response.status_code == 200:
        data = response.get_json()
        assert 'telemetry' in data
        assert 'row_index' in data
        assert 'next_index' in data
        t = data['telemetry']
        assert 'rpm' in t
        assert 'oil_pressure' in t
        assert 'coolant_temperature' in t


def test_simulated_data_invalid_index(client):
    """Simulated data should reject non-integer index."""
    response = client.get('/simulated-data?index=abc')
    assert response.status_code == 400


def test_explanation_engine_all_normal():
    """All-normal features should produce a default explanation."""
    norm_features = {
        'norm_dtc': 0.0, 'norm_temp': 0.0, 'norm_load': 0.0,
        'norm_rpm': 0.0, 'norm_trim': 0.0, 'norm_throttle': 0.0,
        'dtc_active': False
    }
    explanations = explanation_engine.generate_explanations(norm_features)
    assert len(explanations) >= 1
    assert "normal" in explanations[0].lower()


def test_explanation_engine_high_stress():
    """High-stress features should produce specific explanations."""
    norm_features = {
        'norm_dtc': 0.0, 'norm_temp': 0.9, 'norm_load': 0.8,
        'norm_rpm': 0.9, 'norm_trim': 0.5, 'norm_throttle': 0.9,
        'dtc_active': False
    }
    explanations = explanation_engine.generate_explanations(norm_features)
    assert len(explanations) >= 2
    assert len(explanations) <= 3


def test_database_vehicle_state_roundtrip():
    """Test database state persistence."""
    database.update_vehicle_state("db_test_car", 85.5, 60.0, 1.5, [0.3, 0.4])
    state = database.get_vehicle_state("db_test_car")
    assert state is not None
    assert state['health_score'] == 85.5
    assert state['cumulative_runtime'] == 60.0
    assert state['cumulative_decay'] == 1.5


def test_database_history_limit():
    """History should respect the limit parameter."""
    vid = "history_limit_test"
    for i in range(10):
        database.add_history_record(vid, f"10:0{i}:00", 100.0 - i, i)
    
    history = database.get_vehicle_history(vid, limit=5)
    assert len(history) == 5
