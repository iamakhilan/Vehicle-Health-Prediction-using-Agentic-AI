import os
import joblib
import json
import pandas as pd
import numpy as np
import shap

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model_xgb.pkl")
feature_config_path = os.path.join(current_dir, "feature_config.json")

# Load model and config once when module starts
model = joblib.load(model_path) if os.path.exists(model_path) else None

with open(feature_config_path, "r") as f:
    config = json.load(f)

feature_mapping = config["feature_mapping"]
feature_columns = config["features"]

# Initialize SHAP Explainer globally once to avoid performance hit per request
explainer = shap.TreeExplainer(model) if model else None



def predict_vehicle_health(input_data):
    if model is None:
        raise ValueError("Model not trained or not found. Please train the model first.")
        
    # Map incoming telemetry to dataset features
    mapped_data = {}
    for api_key, dataset_key in feature_mapping.items():
        if api_key in input_data:
            mapped_data[dataset_key] = input_data[api_key]
        else:
            # Default to 0 or some value if missing, though API should provide them
            mapped_data[dataset_key] = 0.0
            
    # Convert to pandas dataframe
    df = pd.DataFrame([mapped_data])
    
    # Ensure correct column order
    df = df[feature_columns]
    
    # Run prediction
    predicted_label = int(model.predict(df)[0])
    # The classes are usually 0 and 1. We want the probability of failure (class 0).
    classes = list(model.classes_)
    faulty_class_idx = classes.index(0) if 0 in classes else 0
    failure_probability = float(model.predict_proba(df)[0][faulty_class_idx])
    
    # Phase 2: Compute localized SHAP feature contributions
    if explainer is None:
        return predicted_label, failure_probability, ["Unknown Feature A", "Unknown Feature B", "Unknown Feature C"]
        
    shap_values = explainer.shap_values(df)
    
    # SHAP returns a matrix. Take the absolute values for the 1st (and only) row
    # If binary classification, shap_values might be a list of arrays. Use the array corresponding to the faulty class (usually index 0 or length 1).
    if isinstance(shap_values, list):
        # Multi-class format
        shap_vals_row = np.abs(shap_values[faulty_class_idx][0])
    else:
        # Binary format
        shap_vals_row = np.abs(shap_values[0])
        
    # Sort indices by descending absolute contribution
    top_indices = np.argsort(shap_vals_row)[::-1]
    top_features = [feature_columns[i] for i in top_indices[:3]]
    
    return predicted_label, failure_probability, top_features
