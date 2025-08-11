### 一、藏文文本分类项目 (idea ex\tib-machine) 1. 所使用的框架和库
- PyTorch ：深度学习框架，用于构建和训练神经网络模型。
- Pandas ：用于数据处理和读取 CSV 文件。
- Scikit-learn ：用于标签编码。
- NumPy ：用于数值计算和数组操作。 2. 文件说明
- data_preprocessing.py ：负责数据预处理，包括文本编码、标签编码和词汇表构建。
- model.py ：定义了一个基于 PyTorch 的藏文分类模型。
- train.py ：使用预处理后的数据训练模型，并保存训练好的模型。


import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import LabelEncoder
import pandas as pd
from collections import Counter
import numpy as np

class TibetanDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_length):
        # 初始化数据集，保存文本、标签、词汇表和最大长度
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_length = max_length

    def __len__(self):
        # 返回数据集的长度
        return len(self.texts)

    def __getitem__(self, idx):
        # 获取指定索引的数据，对文本进行编码和填充
        text = self.texts[idx]
        label = self.labels[idx]

        # 文本编码
        encoded_text = [self.vocab.get(word, 0) for word in text]
        encoded_text = encoded_text[:self.max_length]
        padded_text = np.pad(encoded_text, (0, self.max_length - len(encoded_text)), 'constant')

        return torch.tensor(padded_text), torch.tensor(label)

def prepare_data(file_path, max_length=100):
    # 读取 CSV 文件，进行标签编码和词汇表构建
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

-----------------------------------------------------------------------------------
-------------------------------------model.py-------------------------------------
-----------------------------------------------------------------------------------
    import torch
import torch.nn as nn

class TibetanClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):
        # 初始化模型，定义嵌入层、全连接层和激活函数
        super(TibetanClassifier, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.fc1 = nn.Linear(embedding_dim * 100, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        # 前向传播，将输入数据通过嵌入层、全连接层和激活函数
        embedded = self.embedding(x)
        embedded = embedded.view(embedded.size(0), -1)
        out = self.fc1(embedded)
        out = self.relu(out)
        out = self.fc2(out)
        return out

        ------------------------------------------------------------------------
        ----------------------------train.py------------------------------------

        import torch
import torch.nn as nn
import torch.optim as optim
from data_preprocessing import prepare_data
from model import TibetanClassifier
from torch.utils.data import DataLoader

# 超参数设置
vocab_size = 10000
embedding_dim = 100
hidden_dim = 128
output_dim = 5
batch_size = 32
epochs = 10

# 准备数据
dataset, label_encoder, vocab = prepare_data('tibetan_data.csv')
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# 初始化模型、损失函数和优化器
model = TibetanClassifier(vocab_size, embedding_dim, hidden_dim, output_dim)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 训练模型
for epoch in range(epochs):
    model.train()
    total_loss = 0
    for texts, labels in dataloader:
        optimizer.zero_grad()
        outputs = model(texts)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(f'Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(dataloader)}')

# 保存模型
torch.save(model.state_dict(), 'tibetan_model.pth')


