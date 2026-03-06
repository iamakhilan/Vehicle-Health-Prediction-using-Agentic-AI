import os
import joblib
import json
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, precision_score, recall_score, f1_score
from xgboost import XGBClassifier
from dataset_loader import load_dataset

def train_model():
    print("Loading dataset...")
    X, y = load_dataset()
    
    print("\nSplitting dataset...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    print("\nTraining XGBoost model...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)
    
    print("\nEvaluating model...")
    y_pred = model.predict(X_test)
    
    print(f"accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"precision: {precision_score(y_test, y_pred, average='binary'):.4f}")
    print(f"recall: {recall_score(y_test, y_pred, average='binary'):.4f}")
    print(f"f1-score: {f1_score(y_test, y_pred, average='binary'):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("\nPlotting feature importance...")
    importances = model.feature_importances_
    plt.figure(figsize=(10, 6))
    plt.barh(list(X.columns), importances)
    plt.xlabel('Importance')
    plt.ylabel('Feature')
    plt.title('Feature Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(current_dir, 'feature_importance.png'))
    plt.close()
    
    print("\nSaving trained model...")
    joblib.dump(model, os.path.join(current_dir, "model_xgb.pkl"))
    
    feature_config = {
        "feature_columns": list(X.columns)
    }
    with open(os.path.join(current_dir, "feature_columns.json"), "w") as f:
        json.dump(feature_config, f)
        
    print("Model training complete. Files saved.")

if __name__ == "__main__":
    train_model()
