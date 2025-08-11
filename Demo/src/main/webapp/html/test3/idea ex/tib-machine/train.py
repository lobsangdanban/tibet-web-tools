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