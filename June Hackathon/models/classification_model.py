import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.utils.class_weight import compute_class_weight
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

# Load your dataset
df = pd.read_csv("D:/Programming/June Hackathon/Dataset/train.csv")

# Target
target = 'fraudulent'

# Drop columns with too many missing values or not useful for classification
drop_cols = ['job_id', 'department', 'salary_range', 'benefits', 'telecommuting', 'location']
df.drop(columns=drop_cols, inplace=True)

# Fill remaining missing text fields with empty string
text_cols = ['title', 'company_profile', 'description', 'requirements']
df[text_cols] = df[text_cols].fillna('')

# Combine text fields into a single column
df['text'] = df['title'] + " " + df['company_profile'] + " " + df['description'] + " " + df['requirements']
df.drop(columns=text_cols, inplace=True)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    df['text'], df[target], test_size=0.2, random_state=42, stratify=df[target]
)

# Compute class weights
class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = dict(zip(np.unique(y_train), class_weights))

# Pipeline: TF-IDF + Logistic Regression
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
    ('clf', LogisticRegression(class_weight=class_weight_dict, max_iter=1000))
])

# Train
pipeline.fit(X_train, y_train)

# Predict
y_pred = pipeline.predict(X_test)
y_prob = pipeline.predict_proba(X_test)[:, 1]

# Evaluation
print("Classification Report:\n", classification_report(y_test, y_pred))
print("ROC-AUC Score:", roc_auc_score(y_test, y_prob))

# Optional: Stratified K-Fold Cross-validation
print("\nCross-Validation ROC-AUC Scores:")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
auc_scores = cross_val_score(pipeline, df['text'], df[target], cv=cv, scoring='roc_auc')
print("Scores:", auc_scores)
print("Mean AUC:", np.mean(auc_scores))
