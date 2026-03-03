import json
from api_server import app

def run_tests():
    client = app.test_client()
    
    # Test 1: High Stress
    print("--- Test 1: High Stress ---")
    res = client.post('/predict', json={
        "rpm": "6500",
        "engine_load": "90%",
        "coolant_temp": 120,
        "throttle_pos": 85,
        "fuel_trim": 20,
        "dtc_flag": True
    })
    print(json.dumps(res.get_json(), indent=2))
    
    # Test 2: Low Stress (Healthy)
    print("\n--- Test 2: Low Stress (Healthy) ---")
    res = client.post('/predict', json={
        "rpm": 2500,
        "engine_load": 30,
        "coolant_temp": 90,
        "throttle_pos": 20,
        "fuel_trim": 2,
        "dtc_flag": False
    })
    print(json.dumps(res.get_json(), indent=2))

if __name__ == "__main__":
    run_tests()
