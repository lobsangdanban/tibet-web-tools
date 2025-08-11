import pygame
import random
import time
import sys
import os

# 初始化 Pygame
try:
    import pygame
    import random
    import time
    import sys
    import os
except Exception as e:
    error_message = f"导入模块时发生错误: {e}"
    print(error_message)
    input("按回车键退出...")
    with open('error_log.txt', 'w', encoding='utf-8') as f:
        f.write(error_message)
    sys.exit(1)

# 初始化 Pygame
try:
    pygame.init()
except Exception as e:
    error_message = f"初始化 Pygame 时发生错误: {e}"
    print(error_message)
    input("按回车键退出...")
    with open('error_log.txt', 'w', encoding='utf-8') as f:
        f.write(error_message)
    sys.exit(1)

# 定义常量
WIDTH = 300
HEIGHT = 600
BLOCK_SIZE = 30
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)

# 创建游戏窗口
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("ར་ཤི་ཡའི་སྒམ་ཆུང་རྩེད་མོ།")

# 定义方块形状
SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]]
]

# 定义方块颜色
COLORS = [
    (0, 255, 0), (255, 0, 0), (0, 255, 255),
    (255, 255, 0), (255, 165, 0), (0, 0, 255),
    (128, 0, 128)
]

class Block:
    def __init__(self, x, y, shape):
        self.x = x
        self.y = y
        self.shape = shape
        self.color = random.choice(COLORS)

    def move_down(self):
        self.y += 1

    def move_left(self):
        self.x -= 1

    def move_right(self):
        self.x += 1

    def rotate(self):
        # 实现方块旋转逻辑
        self.shape = list(map(list, zip(*self.shape[::-1])))

    def draw(self):
        for i in range(len(self.shape)):
            for j in range(len(self.shape[0])):
                if self.shape[i][j] == 1:
                    pygame.draw.rect(screen, self.color,
                                     ((self.x + j) * BLOCK_SIZE, (self.y + i) * BLOCK_SIZE,
                                      BLOCK_SIZE, BLOCK_SIZE))

def create_grid():
    grid = [[0] * (WIDTH // BLOCK_SIZE) for _ in range(HEIGHT // BLOCK_SIZE)]
    return grid

def draw_grid(grid):
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            pygame.draw.rect(screen, GRAY,
                             (j * BLOCK_SIZE, i * BLOCK_SIZE,
                              BLOCK_SIZE, BLOCK_SIZE), 1)

def is_collision(grid, block):
    for i in range(len(block.shape)):
        for j in range(len(block.shape[0])):
            if block.shape[i][j] == 1:
                new_x = block.x + j
                new_y = block.y + i
                if new_y >= len(grid) or new_x < 0 or new_x >= len(grid[0]) or (new_y >= 0 and grid[new_y][new_x] != 0):
                    return True
    return False

def merge_block(grid, block):
    for i in range(len(block.shape)):
        for j in range(len(block.shape[0])):
            if block.shape[i][j] == 1:
                grid[block.y + i][block.x + j] = block.color
    return grid

def clear_lines(grid):
    full_lines = []
    for i in range(len(grid)):
        if all(grid[i]):
            full_lines.append(i)

    for line in full_lines:
        del grid[line]
        grid = [[0] * (WIDTH // BLOCK_SIZE)] + grid

    return grid, len(full_lines)

def main():
    clock = pygame.time.Clock()
    grid = create_grid()
    current_block = Block(WIDTH // BLOCK_SIZE // 2 - len(SHAPES[0][0]) // 2, 0, random.choice(SHAPES))
    game_over = False
    fall_time = 0
    fall_speed = 0.6  # 方块自动下落的时间间隔
    fast_fall_speed = 0.1  # 快速下落的时间间隔
    lines_cleared = 0  # 记录消除的行数
    start_time = time.time()  # 记录游戏开始时间
    is_fast_falling = False  # 标记是否正在快速下落
    left_key_pressed = False
    right_key_pressed = False
    move_time = 0
    move_speed = 0.1  # 左右移动的时间间隔

    while not game_over:
        fall_time += clock.get_rawtime()
        move_time += clock.get_rawtime()
        clock.tick()

        current_fall_speed = fast_fall_speed if is_fast_falling else fall_speed
        if fall_time / 1000 >= current_fall_speed:
            fall_time = 0
            temp_block = Block(current_block.x, current_block.y, current_block.shape)
            temp_block.move_down()
            if is_collision(grid, temp_block):
                grid = merge_block(grid, current_block)
                # 检查并清除满行
                grid, cleared_count = clear_lines(grid)
                lines_cleared += cleared_count
                current_block = Block(WIDTH // BLOCK_SIZE // 2 - len(SHAPES[0][0]) // 2, 0, random.choice(SHAPES))
                if is_collision(grid, current_block):
                    game_over = True
            else:
                current_block.move_down()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                game_over = True
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    if not left_key_pressed:
                        left_key_pressed = True
                        temp_block = Block(current_block.x, current_block.y, current_block.shape)
                        temp_block.move_left()
                        if not is_collision(grid, temp_block):
                            # 确保只移动一格
                            current_block.move_left()
                elif event.key == pygame.K_RIGHT:
                    if not right_key_pressed:
                        right_key_pressed = True
                        temp_block = Block(current_block.x, current_block.y, current_block.shape)
                        temp_block.move_right()
                        if not is_collision(grid, temp_block):
                            # 确保只移动一格
                            current_block.move_right()
                elif event.key == pygame.K_DOWN:
                    is_fast_falling = True
                elif event.key == pygame.K_UP:
                    temp_block = Block(current_block.x, current_block.y, current_block.shape)
                    temp_block.rotate()
                    if not is_collision(grid, temp_block):
                        current_block.rotate()
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_LEFT:
                    left_key_pressed = False
                elif event.key == pygame.K_RIGHT:
                    right_key_pressed = False
                elif event.key == pygame.K_DOWN:
                    is_fast_falling = False

        screen.fill(BLACK)
        draw_grid(grid)
        current_block.draw()

        # 绘制已经固定的方块
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] != 0:
                    pygame.draw.rect(screen, grid[i][j],
                                     (j * BLOCK_SIZE, i * BLOCK_SIZE,
                                      BLOCK_SIZE, BLOCK_SIZE))

        # 指定支持多语言的字体
        if getattr(sys, 'frozen', False):
            # 如果是打包后的exe文件
            base_path = sys._MEIPASS
        else:
            # 如果是直接运行的Python脚本
            base_path = os.path.dirname(os.path.abspath(__file__))
        
        font_path = os.path.join(base_path, 'himalaya_0.ttf')
        font = pygame.font.Font(font_path, 36)
        lines_text = font.render(f"ཐིག་གྲངས།: {lines_cleared}", True, WHITE)
        screen.blit(lines_text, (10, 10))
        elapsed_time = int(time.time() - start_time)
        time_text = font.render(f"སྐར་ཆ།: {elapsed_time}s", True, WHITE)
        screen.blit(time_text, (10, 50))

        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        error_message = f"程序发生错误: {e}"
        print(error_message)
        input("按回车键退出...")
        with open('error_log.txt', 'w', encoding='utf-8') as f:
            f.write(error_message)

# 以下是多行注释示例
"""
tetris_game.py
├── 初始化模块
│   ├── 导入必要库 (pygame, random, time)
│   ├── 初始化 Pygame
│   ├── 定义常量 (窗口大小、方块大小、颜色等)
│   └── 创建游戏窗口
├── 方块定义模块
│   ├── 定义方块形状 (SHAPES)
│   ├── 定义方块颜色 (COLORS)
│   └── 方块类 (Block)
│       ├── 初始化方法 (__init__)
│       ├── 移动方法 (move_down, move_left, move_right)
│       ├── 旋转方法 (rotate)
│       └── 绘制方法 (draw)
├── 游戏逻辑模块
│   ├── 创建网格 (create_grid)
│   ├── 绘制网格 (draw_grid)
│   ├── 碰撞检测 (is_collision)
│   ├── 合并方块到网格 (merge_block)
│   └── 清除满行 (clear_lines)
└── 主循环模块 (main)
    ├── 初始化游戏状态
    ├── 处理方块自动下落
    ├── 处理用户输入 (键盘事件)
    ├── 绘制游戏界面
    └── 显示游戏信息 (消除行数、游戏时间)
"""
