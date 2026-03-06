import pandas as pd
import os

def load_dataset():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'data', 'engine_data.csv')
    df = pd.read_csv(data_path)
    
    feature_cols = [
        'Engine rpm',
        'Lub oil pressure',
        'Fuel pressure',
        'Coolant pressure',
        'lub oil temp',
        'Coolant temp'
    ]
    target_col = 'Engine Condition'
    
    X = df[feature_cols]
    y = df[target_col]
    
    print(f"Shape: {df.shape}")
    print("\nHead:")
    print(df.head())
    print("\nTarget Value Counts:")
    print(df[target_col].value_counts())
    
    return X, y

if __name__ == "__main__":
    load_dataset()
