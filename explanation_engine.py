def generate_explanations(norm_features):
    """
    Determines the top contributors to the vehicle stress.
    Returns 2-3 human-readable statements.
    """
    contributors = []
    
    if norm_features.get('dtc_active'):
        contributors.append(("Active trouble codes detected", 1.0))
        
    if norm_features.get('norm_temp', 0) > 0.3:
        contributors.append(("Coolant temperature above optimal range", norm_features['norm_temp']))
        
    if norm_features.get('norm_load', 0) > 0.6:
        contributors.append(("Elevated engine load", norm_features['norm_load']))
        
    if norm_features.get('norm_rpm', 0) > 0.7:
        contributors.append(("High engine RPM", norm_features['norm_rpm']))
        
    if norm_features.get('norm_trim', 0) > 0.4:
        contributors.append(("Fuel trim imbalance detected", norm_features['norm_trim']))
        
    if norm_features.get('norm_throttle', 0) > 0.8:
        contributors.append(("Aggressive throttle position", norm_features['norm_throttle']))
        
    # Sort by severity (descending)
    contributors.sort(key=lambda x: x[1], reverse=True)
    
    # Take top 2-3 
    top_contributors = [c[0] for c in contributors[:3]]
    
    # Fallback if everything is fine
    if not top_contributors:
        top_contributors = ["All systems operating within normal parameters"]
        
    return top_contributors
