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
pygame.display.set_caption("推箱子：冒泡排序模拟")

# 颜色定义
white = (255, 255, 255)
black = (0, 0, 0)
gray = (128, 128, 128)
blue = (0, 0, 255)
green = (0, 255, 0)
red = (255, 0, 0)
yellow = (255, 255, 0)  # 用于突出显示正在比较的元素

# 字体
font = pygame.font.Font(None, 30)
large_font = pygame.font.Font(None, 40)  # 更大的字体

# 游戏元素尺寸
tile_size = 40
player_size = tile_size
box_size = tile_size
target_size = tile_size

# 关卡设计（简化，仅包含数字和目标位置）
# 0: 空地, 1: 墙, 2: 箱子, 3: 目标, 4: 玩家, 5: 数字
# 初始关卡数据
level_data = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

# 初始玩家位置
player_x, player_y = 1, 7

# 箱子初始位置 (从 level_data 中提取)
boxes = []
numbers = [] # 存储数字及其位置
for y, row in enumerate(level_data):
    for x, cell in enumerate(row):
        if cell == 5:
            boxes.append((x, y))
            numbers.append((x, y, row[x])) # 存储 (x, y, value)

# 目标位置 (从 level_data 中提取)
targets = []
for y, row in enumerate(level_data):
    for x, cell in enumerate(row):
        if cell == 3:
            targets.append((x, y))

# 游戏状态
game_over = False
message = ""
sorting = False  # 是否正在排序
sorting_step = 0  # 当前排序步骤
sorted_numbers = [] # 保存排序后的数字
compare_pair = None # 保存正在比较的数字对

# 辅助函数

def draw_wall(x, y):
    """绘制墙"""
    pygame.draw.rect(screen, blue, (x * tile_size, y * tile_size, tile_size, tile_size))
    pygame.draw.rect(screen, black, (x * tile_size, y * tile_size, tile_size, tile_size), 2)

def draw_floor(x, y):
    """绘制地板"""
    pygame.draw.rect(screen, gray, (x * tile_size, y * tile_size, tile_size, tile_size))

def draw_player(x, y):
    """绘制玩家"""
    pygame.draw.circle(screen, green,
                       (x * tile_size + player_size // 2, y * tile_size + player_size // 2),
                       player_size // 2)

def draw_box(x, y, is_target=False):
    """绘制箱子，如果位于目标位置，改变颜色"""
    if is_target:
        pygame.draw.rect(screen, yellow, (x * tile_size, y * tile_size, box_size, box_size))
    else:
        pygame.draw.rect(screen, red, (x * tile_size, y * tile_size, box_size, box_size))
    pygame.draw.rect(screen, black, (x * tile_size, y * tile_size, box_size, box_size), 2)

def draw_target(x, y):
    """绘制目标位置"""
    pygame.draw.rect(screen, green, (x * tile_size, y * tile_size, target_size, target_size), 3)

def draw_number(x, y, number, is_comparing=False):
    """绘制数字，如果正在比较，改变颜色"""
    if is_comparing:
        text_color = yellow # 使用黄色
    else:
        text_color = white
    number_text = font.render(str(number), True, text_color)
    text_x = x * tile_size + (tile_size - number_text.get_width()) // 2
    text_y = y * tile_size + (tile_size - number_text.get_height()) // 2
    screen.blit(number_text, (text_x, text_y))

def display_message(msg):
    """显示消息"""
    text = font.render(msg, True, white)
    text_rect = text.get_rect(center=(screen_width // 2, screen_height - 50))
    screen.blit(text, text_rect)

def check_win():
    """检查是否所有箱子都在目标位置"""
    for box in boxes:
        if box not in targets:
            return False
    return True

def swap_boxes(index1, index2):
    """交换两个箱子的位置和数值"""
    global boxes, numbers
    boxes[index1], boxes[index2] = boxes[index2], boxes[index1]
    # 同时交换 numbers 列表中的元素
    num1_x, num1_y, val1 = numbers[index1]
    num2_x, num2_y, val2 = numbers[index2]
    numbers[index1] = (num2_x, num2_y, val2)
    numbers[index2] = (num1_x, num1_y, val1)

def move_player(dx, dy):
    """移动玩家，并处理箱子的移动"""
    global player_x, player_y, boxes, game_over, message
    new_x, new_y = player_x + dx, player_y + dy

    # 检查是否是墙
    if level_data[new_y][new_x] == 1:
        return

    # 检查是否是箱子
    box_index = -1
    for i, box in enumerate(boxes):
        if box == (new_x, new_y):
            box_index = i
            break
    
    if box_index != -1:
        # 尝试推动箱子
        new_box_x, new_box_y = new_x + dx, new_y + dy
        
        # 检查箱子前面是否是墙或另一个箱子
        if (level_data[new_box_y][new_box_x] == 1 or
            (new_box_x, new_box_y) in boxes):
            return  # 不能推动
        
        # 推动箱子
        boxes[box_index] = (new_box_x, new_box_y)
        numbers[box_index] = (new_box_x, new_box_y, numbers[box_index][2]) # 更新数字位置
        player_x, player_y = new_x, new_y
    else:
        # 移动玩家
        player_x, player_y = new_x, new_y

    if check_win():
        game_over = True
        message = "恭喜你，完成解谜！"

def reset_game():
    """重置游戏到初始状态"""
    global player_x, player_y, boxes, game_over, message, level_data, sorting, sorting_step, sorted_numbers, numbers
    player_x, player_y = 1, 7
    boxes = []
    numbers = []
    for y, row in enumerate(level_data):
        for x, cell in enumerate(row):
            if cell == 5:
                boxes.append((x, y))
                numbers.append((x, y, row[x]))
    game_over = False
    message = ""
    sorting = False
    sorting_step = 0
    sorted_numbers = []

def start_sort():
    """开始冒泡排序"""
    global sorting, sorting_step, sorted_numbers, numbers
    if not sorting:
        sorting = True
        sorting_step = 0
        sorted_numbers = [numbers[i][2] for i in range(len(numbers))] # 从 numbers 列表中提取数值
        #print("Start Sort:", sorted_numbers) # Debug
        message = "开始排序..."

def bubble_sort_step():
    """执行冒泡排序的下一步"""
    global sorting, sorting_step, game_over, message, sorted_numbers, compare_pair, numbers

    if not sorting:
        return

    n = len(sorted_numbers)
    if sorting_step < n - 1:
        for i in range(n - 1 - sorting_step):
            compare_pair = (i, i + 1) # 记录比较的pair
            if sorted_numbers[i] > sorted_numbers[i + 1]:
                #print(f"Swap {sorted_numbers[i]} and {sorted_numbers[i+1]}")
                sorted_numbers[i], sorted_numbers[i + 1] = sorted_numbers[i + 1], sorted_numbers[i]
                swap_boxes(i, i + 1) # 交换箱子
                return # 只做一步交换, 下一步再继续
        sorting_step += 1
    else:
        sorting = False
        game_over = True
        message = "排序完成！"
        compare_pair = None # 清空比较pair
        # 检查是否排序正确
        is_correct = True
        for i in range(n - 1):
            if sorted_numbers[i] > sorted_numbers[i+1]:
                is_correct = False
                break
        if is_correct:
            message += " 排序正确！"
        else:
            message += " 排序错误！"
        print("Sorted Numbers:", sorted_numbers) #debug

# 游戏主循环
running = True
while running:
    screen.fill(black)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if not game_over:
                if event.key == pygame.K_UP:
                    move_player(0, -1)
                elif event.key == pygame.K_DOWN:
                    move_player(0, 1)
                elif event.key == pygame.K_LEFT:
                    move_player(-1, 0)
                elif event.key == pygame.K_RIGHT:
                    move_player(1, 0)
            if event.key == pygame.K_r:  # 按下 'r' 重置游戏
                reset_game()
            if event.key == pygame.K_SPACE: # 按下空格开始排序
                start_sort()
        elif event.type == pygame.MOUSEBUTTONDOWN: # 鼠标点击
            if reset_button_rect.collidepoint(event.pos):
                reset_game()
            if sort_button_rect.collidepoint(event.pos):
                start_sort()

    # 绘制游戏元素
    for y, row in enumerate(level_data):
        for x, cell in enumerate(row):
            if cell == 1:
                draw_wall(x, y)
            elif cell == 3:
                draw_target(x, y)
            elif cell == 0:
                draw_floor(x, y) # 画地板
    
    # 绘制箱子和数字
    for i, box in enumerate(boxes):
        x, y = box
        is_target = (x, y) in targets
        draw_box(x, y, is_target)
        # 绘制数字，并判断是否需要高亮显示
        if compare_pair:
            if i == compare_pair[0] or i == compare_pair[1]:
                draw_number(x, y, numbers[i][2], is_comparing=True)
            else:
                draw_number(x, y, numbers[i][2], is_comparing=False)
        else:
             draw_number(x, y, numbers[i][2], is_comparing=False)
    
    draw_player(player_x, player_y)
    display_message(message)

    # 绘制 "重置" 和 "开始排序" 按钮
    reset_button_text = large_font.render("重置", True, white) # 增大字体
    sort_button_text = large_font.render("排序", True, white)
    reset_button_rect = reset_button_text.get_rect(topleft=(20, screen_height - 60)) # 调整位置
    sort_button_rect = sort_button_text.get_rect(topleft=(120, screen_height - 60))
    pygame.draw.rect(screen, blue, reset_button_rect)
    pygame.draw.rect(screen, green, sort_button_rect)
    screen.blit(reset_button_text, reset_button_rect)
    screen.blit(sort_button_text, sort_button_rect)

    if sorting:
        bubble_sort_step() # 执行排序的下一步

    pygame.display.flip()
    pygame.time.delay(300) # 控制游戏速度， 降低CPU占用
    
pygame.quit()
sys.exit()


