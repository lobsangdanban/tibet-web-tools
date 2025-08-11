import pygame
import sys
import random
import time

# 初始化 Pygame
pygame.init()

# 屏幕尺寸
screen_width = 800
screen_height = 600
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("康威生命游戏")

# 颜色定义
white = (255, 255, 255)
black = (0, 0, 0)
gray = (128, 128, 128)
green = (0, 255, 0)
blue = (0, 0, 255)
red = (255, 0, 0)

# 网格尺寸
cell_size = 10
grid_width = screen_width // cell_size
grid_height = screen_height // cell_size

# 游戏状态
grid = [[0] * grid_width for _ in range(grid_height)]  # 0: dead, 1: alive
running = False
pause = True  # 初始状态暂停
generation = 0  # 世代计数

# 字体
font = pygame.font.Font(None, 30)
large_font = pygame.font.Font(None, 40)  # 更大的字体


class GameGrid:
    """
    表示康威生命游戏的网格。
    """

    def __init__(self, width, height):
        """
        初始化网格。

        Args:
            width (int): 网格宽度。
            height (int): 网格高度。
        """
        self.width = width
        self.height = height
        self.grid = [[0] * width for _ in range(height)]
        self.generation = 0

    def initialize(self):
        """
        随机初始化网格。
        """
        for y in range(self.height):
            for x in range(self.width):
                self.grid[y][x] = random.choice([0, 1])
        self.generation = 0

    def count_neighbors(self, x, y):
        """
        计算细胞周围的活细胞数量。

        Args:
            x (int): 细胞的 x 坐标。
            y (int): 细胞的 y 坐标。

        Returns:
            int: 活细胞的数量。
        """
        neighbors = 0
        for i in range(-1, 2):
            for j in range(-1, 2):
                if i == 0 and j == 0:
                    continue
                nx, ny = x + i, y + j
                if 0 <= nx < self.width and 0 <= ny < self.height and self.grid[ny][nx] == 1:
                    neighbors += 1
        return neighbors

    def update(self):
        """
        更新网格状态。
        """
        next_grid = [[0] * self.width for _ in range(self.height)]
        for y in range(self.height):
            for x in range(self.width):
                neighbors = self.count_neighbors(x, y)
                if self.grid[y][x] == 1:  # 活细胞
                    if neighbors == 2 or neighbors == 3:
                        next_grid[y][x] = 1  # 生存
                    else:
                        next_grid[y][x] = 0  # 死亡
                else:  # 死细胞
                    if neighbors == 3:
                        next_grid[y][x] = 1  # 复活
                    else:
                        next_grid[y][x] = 0
        self.grid = next_grid
        self.generation += 1

    def draw(self, surface, cell_size):
        """
        绘制网格。

        Args:
            surface (pygame.Surface): 要绘制的 Surface。
            cell_size (int): 细胞的大小。
        """
        surface.fill(black)
        for y in range(self.height):
            for x in range(self.width):
                if self.grid[y][x] == 1:
                    pygame.draw.rect(surface, green,
                                     (x * cell_size, y * cell_size, cell_size, cell_size))
                else:
                    pygame.draw.rect(surface, gray,
                                     (x * cell_size, y * cell_size, cell_size, cell_size), 1)

    def get_generation(self):
        """
        获取当前的世代数。

        Returns:
            int: 当前世代数。
        """
        return self.generation


class Game:
    """
    表示康威生命游戏的整体。
    包含网格、界面和游戏循环。
    """

    def __init__(self, screen, grid_width, grid_height, cell_size):
        """
        初始化游戏。

        Args:
            screen (pygame.Surface): 游戏窗口。
            grid_width (int): 网格宽度。
            grid_height (int): 网格高度。
            cell_size (int): 细胞大小
        """
        self.screen = screen
        self.grid = GameGrid(grid_width, grid_height)
        self.cell_size = cell_size
        self.running = False
        self.pause = True
        self.start_pause_button_rect = None
        self.reset_button_rect = None
        self.generation_display_rect = None # 世代显示区域

    def initialize(self):
        """
        初始化游戏。
        """
        self.grid.initialize()
        self.running = False
        self.pause = True
        self.generation = 0

    def handle_events(self):
        """
        处理游戏事件。
        """
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    self.running = not self.running
                    self.pause = not self.pause
                elif event.key == pygame.K_r:
                    self.initialize()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.handle_mouse_click(event)

    def handle_mouse_click(self, event):
        """
        处理鼠标点击事件。
        """
        # 检查是否点击了网格
        grid_x = event.pos[0] // self.cell_size
        grid_y = event.pos[1] // self.cell_size
        if 0 <= grid_x < self.grid.width and 0 <= grid_y < self.grid.height:
            self.grid.grid[grid_y][grid_x] = 1 - self.grid.grid[grid_y][grid_x]  # 切换细胞状态
        # 检查是否点击了按钮
        if self.start_pause_button_rect and self.start_pause_button_rect.collidepoint(event.pos):
            if self.pause:  # 如果当前是暂停状态，点击 Start
                self.pause = False
                self.running = True
        elif self.pause_button_rect and self.pause_button_rect.collidepoint(event.pos):
            if not self.pause:  # 如果当前是运行状态，点击 Pause
                self.pause = True
                self.running = False
        elif self.reset_button_rect and self.reset_button_rect.collidepoint(event.pos):
            self.initialize()

    def draw(self):
        """
        绘制游戏界面。
        """
        self.grid.draw(self.screen, self.cell_size)
        self.display_generation()
        self.start_pause_button_rect, self.pause_button_rect, self.reset_button_rect = self.display_control_buttons() # 获取按钮rect

    def display_generation(self):
        """
        显示世代数。
        """
        text = large_font.render(f"Generation: {self.grid.get_generation()}", True, white)  # 使用 large_font
        self.generation_display_rect = text.get_rect(topleft=(10, 10))
        self.screen.blit(text, self.generation_display_rect)

    def display_control_buttons(self):
        """
        显示控制按钮.
        """
        start_pause_text = large_font.render("Start", True, white)  # 简化文本
        pause_text = large_font.render("Pause", True, white)
        reset_text = large_font.render("Reset", True, white)  # 保持文本一致
        # 定义按钮的 Rect
        start_pause_button_rect = start_pause_text.get_rect(topleft=(10, screen_height - 50))  # 调整按钮位置
        pause_button_rect = pause_text.get_rect(
            topleft=(10 + start_pause_button_rect.width + 10, screen_height - 50))
        reset_button_rect = reset_text.get_rect(
            topleft=(10 + start_pause_button_rect.width + 10 + pause_button_rect.width + 10,
                     screen_height - 50))  # 调整按钮位置，避免重叠

        # 画按钮
        pygame.draw.rect(self.screen, green, start_pause_button_rect)
        pygame.draw.rect(self.screen, blue, pause_button_rect)
        pygame.draw.rect(self.screen, red, reset_button_rect)  # 绘制reset按钮

        # 画按钮文字
        screen.blit(start_pause_text, start_pause_button_rect)
        screen.blit(pause_text, pause_button_rect)
        screen.blit(reset_text, reset_button_rect)  # 绘制reset按钮文字

        return start_pause_button_rect, pause_button_rect, reset_button_rect

    def update(self):
        """
        更新游戏状态。
        """
        if not self.pause:
            self.grid.update()

    def run(self):
        """
        运行游戏主循环。
        """
        self.initialize()
        while True:
            self.handle_events()
            self.draw()
            self.update()
            pygame.display.flip()
            pygame.time.delay(100)  # 控制游戏速度


if __name__ == '__main__':
    game = Game(screen, grid_width, grid_height, cell_size)
    game.run()

 
# 这个版本对代码进行了重构，使其更加模块化和易于维护。主要改进包括：

# GameGrid 类： 封装了网格的逻辑，包括初始化、更新和绘制。
# Game 类： 封装了游戏的整体逻辑，包括事件处理、界面绘制和游戏循环。
# 清晰的职责分离： 每个类和函数都有明确的职责，使代码更易于理解和调试。
# 使用对象来管理游戏状态： 使用 Game 和 GameGrid 的实例来管理游戏的状态，而不是全局变量。
# 希望这个重构后的版本能够解决您之前遇到的问题，并提供一个更稳定和可扩展的康威生命游戏实现。


