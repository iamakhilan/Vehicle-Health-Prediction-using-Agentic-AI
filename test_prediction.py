import json
from api_server import app

def run_tests():
    client = app.test_client()
    
    # Test 1: High Stress
    print("--- Test 1: High Stress ---")
    res = client.post('/predict', json={
        "vehicle_id": "test_high_stress",
        "engine_runtime": 60,
        "rpm": 6500,
        "oil_pressure": 1.5,
        "fuel_pressure": 3.0,
        "coolant_pressure": 4.0,
        "oil_temp": 110,
        "coolant_temperature": 120,
        "engine_load": 90,
        "coolant_temp": 120,
        "throttle_pos": 85,
        "fuel_trim": 20,
        "dtc_flag": True
    })
    print(json.dumps(res.get_json(), indent=2))
    
    # Test 2: Low Stress (Healthy)
    print("\n--- Test 2: Low Stress (Healthy) ---")
    res = client.post('/predict', json={
        "vehicle_id": "test_low_stress",
        "engine_runtime": 60,
        "rpm": 800,
        "oil_pressure": 3.5,
        "fuel_pressure": 7.0,
        "coolant_pressure": 2.0,
        "oil_temp": 77,
        "coolant_temperature": 75,
        "engine_load": 30,
        "coolant_temp": 75,
        "throttle_pos": 20,
        "fuel_trim": 2,
        "dtc_flag": False
    })
    print(json.dumps(res.get_json(), indent=2))

if __name__ == "__main__":
    run_tests()
