def normalize_features(data):
    """
    Parses and normalizes OBD telemetry data into a 0.0 - 1.0 stress-aligned scale.
    """
    try:
        # Convert inputs to float safely
        rpm = float(str(data.get('rpm', 0)).replace(',', '').replace('%', ''))
        load = float(str(data.get('engine_load', 0)).replace(',', '').replace('%', ''))
        coolant_temp = float(str(data.get('coolant_temp', 90)).replace(',', '').replace('%', ''))
        throttle = float(str(data.get('throttle_pos', 0)).replace(',', '').replace('%', ''))
        fuel_trim = float(str(data.get('fuel_trim', 0)).replace(',', '').replace('%', ''))
        dtc_active = bool(data.get('dtc_flag', False))
    except ValueError:
        rpm, load, coolant_temp, throttle, fuel_trim, dtc_active = 0, 0, 90, 0, 0, False

    # Normalization (0.0 to 1.0 where 1.0 is max stress)
    norm_rpm = min(1.0, max(0.0, rpm / 8000.0))  # Assuming 8000 is redline
    norm_load = min(1.0, max(0.0, load / 100.0))
    
    # Coolant: optimal is around 90C. Distress if > 110C
    if coolant_temp <= 90:
        norm_temp = 0.0
    elif coolant_temp >= 120:
        norm_temp = 1.0
    else:
        norm_temp = (coolant_temp - 90) / 30.0
        
    norm_throttle = min(1.0, max(0.0, throttle / 100.0))
    
    # Fuel trim: ideal is 0. Stress if absolute value is high (e.g. > 15)
    norm_trim = min(1.0, max(0.0, abs(fuel_trim) / 25.0))
    
    norm_dtc = 1.0 if dtc_active else 0.0
    
    return {
        'norm_rpm': norm_rpm,
        'norm_load': norm_load,
        'norm_temp': norm_temp,
        'norm_throttle': norm_throttle,
        'norm_trim': norm_trim,
        'norm_dtc': norm_dtc,
        # Keep raw values for explanation
        'raw_rpm': rpm,
        'raw_load': load,
        'raw_temp': coolant_temp,
        'raw_throttle': throttle,
        'raw_trim': fuel_trim,
        'dtc_active': dtc_active
    }
