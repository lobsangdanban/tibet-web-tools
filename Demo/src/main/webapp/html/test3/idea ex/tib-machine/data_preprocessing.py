import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from collections import Counter
import numpy as np

class TibetanDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_length):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]

        # 文本编码
        encoded_text = [self.vocab.get(word, 0) for word in text]
        encoded_text = encoded_text[:self.max_length]
        padded_text = np.pad(encoded_text, (0, self.max_length - len(encoded_text)), 'constant')

        return torch.tensor(padded_text), torch.tensor(label)

def prepare_data(file_path, max_length=100):
    df = pd.read_csv(file_path)
    texts = df['text'].tolist()
    labels = df['label'].tolist()

    # 标签编码
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)

    # 构建词汇表
    all_words = [word for text in texts for word in text]
    word_counts = Counter(all_words)
    vocab = {word: idx + 1 for idx, (word, _) in enumerate(word_counts.most_common())}

    dataset = TibetanDataset(texts, encoded_labels, vocab, max_length)
    return dataset, label_encoder, vocab