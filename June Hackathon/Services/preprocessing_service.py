import pandas as pd


def preprocess_data(df):
    """
    Preprocess the job data for fraud detection.
    Combines text fields and creates simple numerical features.
    """
    df['combined_text'] = df[['title', 'description', 'company_profile', 'requirements']].fillna('').agg(' '.join,
                                                                                                         axis=1)
    df['telecommuting'] = df['telecommuting'].fillna(0)
    df['text_length'] = df['combined_text'].apply(len)
    df['word_count'] = df['combined_text'].apply(lambda x: len(x.split()))

    X = df[['combined_text', 'text_length', 'word_count', 'telecommuting']]
    y = df['fraudulent'] if 'fraudulent' in df.columns else None  # if labels are present

    return X, y
