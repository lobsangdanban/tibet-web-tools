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
pygame.display.set_caption("经济生命游戏")

# 颜色定义
white = (255, 255, 255)
black = (0, 0, 0)
gray = (128, 128, 128)
green = (0, 255, 0)
blue = (0, 0, 255)
red = (255, 0, 0)
yellow = (255, 255, 0)  # 代表富裕细胞
brown = (165, 42, 42)  # 代表贫困细胞

# 网格尺寸
cell_size = 10
grid_width = 80  # 更多的网格
grid_height = 60

# 初始资金
initial_wealth = 100

# 经济参数
production_rate = 10  # 每个周期生产的财富
consumption_rate = 5  # 每个周期消耗的财富
tax_rate = 0.1  # 税率
welfare_rate = 0.2  # 福利率
inflation_rate = 0.02  # 通货膨胀率
trade_probability = 0.2 # 细胞之间交易的概率

# 游戏状态
grid = [[0] * grid_width for _ in range(grid_height)]  # 0: 死亡, 1: 贫穷, 2: 富裕
wealth = [[initial_wealth] * grid_width for _ in range(grid_height)]  # 每个细胞的财富
running = False
pause = True
generation = 0
global_wealth = 0 # 整个系统的财富

# 字体
font = pygame.font.Font(None, 30)
large_font = pygame.font.Font(None, 40)

class EconomicCell:
    """
    表示具有经济行为的细胞
    """
    def __init__(self, x, y, status=0, wealth=initial_wealth):
        """
        初始化细胞

        Args:
            x (int): x坐标
            y (int): y坐标
            status (int): 细胞状态 (0: 死亡, 1: 贫穷, 2: 富裕)
            wealth (int): 细胞的财富
        """
        self.x = x
        self.y = y
        self.status = status
        self.wealth = wealth
        self.production_rate = production_rate
        self.consumption_rate = consumption_rate

    def produce(self):
        """
        生产财富
        """
        self.wealth += self.production_rate
        return self.production_rate

    def consume(self):
        """
        消耗财富
        """
        self.wealth -= self.consumption_rate
        return self.consumption_rate

    def trade(self, other):
        """
        与其他细胞交易财富
        """
        if random.random() < trade_probability:
            max_trade_amount = int(min(self.wealth, other.wealth))  # 将最大值转换为整数
            if max_trade_amount > 0:
                trade_amount = random.randint(1, max_trade_amount)
                self.wealth -= trade_amount
                other.wealth += trade_amount
                return trade_amount
        return 0

    def get_status(self):
        """
        获取细胞状态
        """
        if self.wealth > 200:  # 可以调整阈值
            return 2 # 富裕
        elif self.wealth > 0:
            return 1 # 贫穷
        else:
            return 0 # 死亡

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
        self.grid = [[0] * width for _ in range(height)]  # 0: 死亡, 1: 贫穷, 2: 富裕
        self.wealth = [[initial_wealth] * width for _ in range(height)] # 细胞的财富
        self.generation = 0
        self.cells = [] # EconomicCell对象的列表
        self.global_wealth = 0

    def initialize(self):
        """
        随机初始化网格。
        """
        self.cells = []
        for y in range(self.height):
            for x in range(self.width):
                status = random.choice([0, 1, 2])
                self.grid[y][x] = status
                self.wealth[y][x] = initial_wealth
                self.cells.append(EconomicCell(x, y, status, initial_wealth))
        self.generation = 0
        self.global_wealth = sum(sum(w) for w in self.wealth)

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
                if 0 <= nx < self.width and 0 <= ny < self.height and self.grid[ny][nx] != 0:
                    neighbors += 1
        return neighbors

    def update(self):
        """
        更新网格状态。
        """
        next_grid = [[0] * self.width for _ in range(self.height)]
        next_wealth = [[0] * self.width for _ in range(self.height)]
        self.global_wealth = 0

        # 创建新的细胞列表
        next_cells = []

        for y in range(self.height):
            for x in range(self.width):
                neighbors = self.count_neighbors(x, y)
                cell = self.get_cell(x, y) # 获取细胞对象
                if cell is None:
                    continue

                # 经济行为
                produced = cell.produce()
                consumed = cell.consume()
                tax = cell.wealth * tax_rate
                cell.wealth -= tax
                self.global_wealth += cell.wealth # 累加财富

                # 交易
                for i in range(-1, 2):
                    for j in range(-1, 2):
                        if i == 0 and j == 0:
                            continue
                        nx, ny = x + i, y + j
                        if 0 <= nx < self.width and 0 <= ny < self.height:
                            other_cell = self.get_cell(nx, ny)
                            if other_cell:
                                traded_amount = cell.trade(other_cell)

                # 细胞状态更新
                status = cell.get_status()
                next_grid[y][x] = status
                next_wealth[y][x] = cell.wealth

                # 康威生命游戏规则
                if self.grid[y][x] != 0:  # 活细胞 (贫穷或富裕)
                    if neighbors == 2 or neighbors == 3:
                        pass  # 生存
                    else:
                        status = 0 # 死亡
                        cell.wealth = 0
                else:  # 死细胞
                    if neighbors == 3:
                        status = 1 # 诞生, 初始贫穷
                        cell.wealth = initial_wealth
                next_grid[y][x] = status
                next_wealth[y][x] = cell.wealth

                # 将更新后的细胞添加到新的细胞列表
                cell.status = status
                next_cells.append(cell)

        self.grid = next_grid
        self.wealth = next_wealth
        self.generation += 1
        self.cells = next_cells # 更新细胞列表

        # 福利分配
        total_tax = sum(sum(w) * tax_rate for w in self.wealth)
        available_welfare = total_tax * welfare_rate
        num_poor = sum(row.count(1) for row in self.grid) # 统计贫穷细胞数量
        if num_poor > 0:
            welfare_per_poor = available_welfare // num_poor
            for cell in self.cells:
                if cell.status == 1:
                    cell.wealth += welfare_per_poor

        # 通货膨胀
        inflation_factor = 1 + inflation_rate
        self.global_wealth *= inflation_factor
        for cell in self.cells:
            cell.wealth *= inflation_factor

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
                cell = self.get_cell(x,y)
                if cell:
                    color = black
                    if cell.status == 2:
                        color = yellow
                    elif cell.status == 1:
                        color = blue
                    elif cell.status == 0:
                        color = gray
                    pygame.draw.rect(surface, color, (x * cell_size, y * cell_size, cell_size, cell_size))

    def get_generation(self):
        """
        获取当前的世代数。

        Returns:
            int: 当前世代数。
        """
        return self.generation

    def get_global_wealth(self):
        """
        获取整个系统的财富
        Returns:
            int: 系统的总财富
        """
        return self.global_wealth

    def get_cell(self, x, y):
        """
        获取指定坐标的细胞对象
        """
        for cell in self.cells:
            if cell.x == x and cell.y == y:
                return cell
        return None


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
        self.generation_display_rect = None
        self.global_wealth_display_rect = None

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
            self.grid.grid[grid_y][grid_x] = 1 - self.grid.grid[grid_y][
                grid_x]  # 切换细胞状态
        # 检查是否点击了按钮
        if self.start_pause_button_rect and self.start_pause_button_rect.collidepoint(
                event.pos):  # 如果点击了 "Start/Pause" 按钮
            self.pause = not self.pause
            self.running = not self.running
        elif self.reset_button_rect and self.reset_button_rect.collidepoint(
                event.pos):  # 如果点击了 "Reset" 按钮
            self.initialize()  # 重置游戏

    def draw(self):
        """
        绘制游戏界面。
        """
        self.grid.draw(self.screen,
                       self.cell_size)  # 绘制游戏网格
        self.display_generation()  # 显示当前世代数
        self.display_global_wealth() # 显示全局财富
        self.start_pause_button_rect, _, self.reset_button_rect = self.display_control_buttons()  # 获取按钮rect

    def display_generation(self):
        """
        显示世代数。
        """
        text = large_font.render(
            f"Generation: {self.grid.get_generation()}",
            True,
            white)  # 使用 large_font 渲染世代数
        self.generation_display_rect = text.get_rect(
            topleft=(10, 10))  # 获取文本的 Rect
        self.screen.blit(text,
                         self.generation_display_rect)  # 将文本绘制到屏幕上

    def display_global_wealth(self):
        """
        显示全局财富
        """
        text = large_font.render(
            f"Global Wealth: {int(self.grid.get_global_wealth())}",
            True,
            white)  # 使用 large_font 渲染
        self.global_wealth_display_rect = text.get_rect(
            topleft=(10, 50))  # 获取文本的 Rect
        self.screen.blit(text,
                         self.global_wealth_display_rect)  # 将文本绘制到屏幕上

    def display_control_buttons(self):
        """
        显示控制按钮.
        """
        start_pause_text = large_font.render("Start/Pause", True,
                                             white)  # 合并按钮文本
        reset_text = large_font.render("Reset", True, white)  # 保持文本一致
        # 定义按钮的 Rect
        start_pause_button_rect = start_pause_text.get_rect(
            topleft=(10, screen_height - 50))  # 调整按钮位置
        reset_button_rect = reset_text.get_rect(
            topleft=(10 + start_pause_button_rect.width + 10,
                     screen_height - 50))  # 调整按钮位置，避免重叠

        # 画按钮
        pygame.draw.rect(self.screen, green,
                         start_pause_button_rect)  # 绘制 "Start/Pause" 按钮
        pygame.draw.rect(self.screen, red,
                         reset_button_rect)  # 绘制 "Reset" 按钮

        # 画按钮文字
        self.screen.blit(start_pause_text, start_pause_button_rect)
        self.screen.blit(reset_text, reset_button_rect)  # 绘制 "Reset" 按钮文字

        return start_pause_button_rect, None, reset_button_rect

    def update(self):
        """
        更新游戏状态。
        """
        if not self.pause:  # 如果游戏没有暂停
            self.grid.update()  # 更新网格状态

    def run(self):
        """
        运行游戏主循环。
        """
        self.initialize()  # 初始化游戏
        while True:  # 游戏主循环
            self.handle_events()  # 处理游戏事件
            self.draw()  # 绘制游戏界面
            self.update()  # 更新游戏状态
            pygame.display.flip()  # 更新屏幕显示
            pygame.time.delay(
                100)  # 控制游戏速度，降低 CPU 占用 (100 毫秒延迟)


if __name__ == '__main__':
    game = Game(screen, grid_width, grid_height,
                cell_size)  # 创建 Game 类的实例
    game.run()  # 运行游戏


