import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import classification_report, roc_auc_score
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

import warnings

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


# 🚀 Training Function
def train_model(pipeline, X_train, y_train):
    pipeline.fit(X_train, y_train)
    return pipeline


# 📊 Evaluation Function
def evaluate_model(model, X, y, dataset_name="Test"):
    y_pred = model.predict(X)
    y_proba = model.predict_proba(X)[:, 1]

    print(f"\n📂 Classification Report ({dataset_name} Set):")
    print(classification_report(y, y_pred))
    print(f"🔍 ROC-AUC Score ({dataset_name}): {roc_auc_score(y, y_proba):.4f}")


# 🧭 Main Driver
def main():
    # Load training data
    df_train = pd.read_csv("D://Programming//June Hackathon//Dataset//train.csv")
    X, y = preprocess_data(df_train)

    # Split training into train/test for validation
    X_train, X_val, y_train, y_val = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)

    # Build and train
    pipeline = build_pipeline()
    trained_model = train_model(pipeline, X_train, y_train)

    # Evaluate on validation
    evaluate_model(trained_model, X_val, y_val, "Validation")

    # Save model and threshold


    # Load and evaluate on real test set if available
    try:
        df_test = pd.read_csv("D://Programming//June Hackathon//Dataset//test.csv")
        if 'fraudulent' in df_test.columns:
            X_test, y_test = preprocess_data(df_test)
            evaluate_model(trained_model, X_test, y_test, "Real Test")
        else:
            print("\n⚠️ Test set does not have 'fraudulent' labels. Skipping evaluation.")
    except FileNotFoundError:
        print("\n❌ test.csv not found. Please make sure it exists at the path.")


if __name__ == "__main__":
    main()
