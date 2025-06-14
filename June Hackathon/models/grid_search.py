import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report, roc_auc_score, f1_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
import warnings
import joblib

warnings.filterwarnings('ignore', category=UserWarning)


# 🧹 Preprocessing Function
def preprocess_data(df):
    df['combined_text'] = df[['title', 'description', 'company_profile', 'requirements']].fillna('').agg(' '.join, axis=1)
    df['telecommuting'] = df['telecommuting'].fillna(0)
    df['text_length'] = df['combined_text'].apply(len)
    df['word_count'] = df['combined_text'].apply(lambda x: len(x.split()))
    return df[['combined_text', 'text_length', 'word_count', 'telecommuting']], df['fraudulent']


# 🔧 Build Pipeline Function
def build_pipeline():
    tfidf = TfidfVectorizer(max_features=300)

    preprocessor = ColumnTransformer(transformers=[
        ('text', tfidf, 'combined_text'),
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler())
        ]), ['text_length', 'word_count', 'telecommuting']),
    ])

    lr = LogisticRegression(class_weight='balanced', max_iter=1000)
    rf = RandomForestClassifier(class_weight='balanced', n_estimators=100, random_state=42)
    lgbm = LGBMClassifier(class_weight='balanced', random_state=42)

    stack_model = StackingClassifier(
        estimators=[('lr', lr), ('rf', rf), ('lgbm', lgbm)],
        final_estimator=LogisticRegression(),
        cv=5
    )

    pipeline = ImbPipeline(steps=[
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('classifier', stack_model)
    ])
    return pipeline


# 🔍 Grid Search Function
def perform_grid_search(pipeline, X_train, y_train):
    # Define grid for Logistic Regression as final estimator
    param_grid = {
        'classifier__final_estimator__C': [0.1, 1, 10]
    }

    grid_search = GridSearchCV(
        pipeline,
        param_grid,
        scoring='f1',
        cv=3,
        n_jobs=-1,
        verbose=2
    )
    grid_search.fit(X_train, y_train)
    print(f"\n✅ Best Parameters from Grid Search: {grid_search.best_params_}")
    return grid_search.best_estimator_


# 🔎 Find Best Threshold Function
def find_best_threshold(model, X_val, y_val):
    y_proba = model.predict_proba(X_val)[:, 1]
    thresholds = np.arange(0.1, 0.9, 0.01)
    f1_scores = []

    for thresh in thresholds:
        y_pred_thresh = (y_proba >= thresh).astype(int)
        score = f1_score(y_val, y_pred_thresh)
        f1_scores.append(score)

    best_thresh = thresholds[np.argmax(f1_scores)]
    best_f1 = max(f1_scores)
    print(f"\n🎯 Best Threshold: {best_thresh:.2f} with F1 Score: {best_f1:.4f}")
    return best_thresh


# 📊 Evaluation Function with Custom Threshold
def evaluate_model(model, X, y, threshold=0.5, dataset_name="Test"):
    y_proba = model.predict_proba(X)[:, 1]
    y_pred = (y_proba >= threshold).astype(int)

    print(f"\n📂 Classification Report ({dataset_name} Set) at threshold {threshold:.2f}:")
    print(classification_report(y, y_pred))
    print(f"🔍 ROC-AUC Score ({dataset_name}): {roc_auc_score(y, y_proba):.4f}")
    print(f"🎯 F1 Score ({dataset_name}): {f1_score(y, y_pred):.4f}")


# 🧭 Main Driver
def main():
    # Load training data
    df_train = pd.read_csv("D://Programming//June Hackathon//Dataset//train.csv")
    X, y = preprocess_data(df_train)

    # Split training into train/test for validation
    X_train, X_val, y_train, y_val = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)

    # Build and Grid Search
    pipeline = build_pipeline()
    best_pipeline = perform_grid_search(pipeline, X_train, y_train)

    # Find best threshold on validation set
    best_threshold = find_best_threshold(best_pipeline, X_val, y_val)

    # Evaluate on validation
    evaluate_model(best_pipeline, X_val, y_val, threshold=best_threshold, dataset_name="Validation")

    joblib.dump((best_pipeline, best_threshold), "../job_fraud_model.pkl")
    print("✅ Model and threshold saved to 'job_fraud_model.pkl'.")

    # Load and evaluate on real test set if available
    try:
        df_test = pd.read_csv("D://Programming//June Hackathon//Dataset//test.csv")
        if 'fraudulent' in df_test.columns:
            X_test, y_test = preprocess_data(df_test)
            evaluate_model(best_pipeline, X_test, y_test, threshold=best_threshold, dataset_name="Real Test")
        else:
            print("\n⚠️ Test set does not have 'fraudulent' labels. Skipping evaluation.")
    except FileNotFoundError:
        print("\n❌ test.csv not found. Please make sure it exists at the path.")


if __name__ == "__main__":
    main()
