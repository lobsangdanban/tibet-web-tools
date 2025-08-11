import turtle
import time
import random

# 设置屏幕
wn = turtle.Screen()
# 设置窗口标题
wn.title("སྦྲུལ་ལྟོ་ཆེའི་རྩེད་མོ།")
# 设置窗口背景颜色
wn.bgcolor("green")
# 设置窗口大小
wn.setup(width=600, height=600)
# 关闭屏幕自动更新
wn.tracer(0)  

# 蛇头
head = turtle.Turtle()
# 设置绘制速度
head.speed(0)
# 设置蛇头形状
head.shape("square")
# 设置蛇头颜色
head.color("black")
# 抬起画笔，移动时不绘制轨迹
head.penup()
# 将蛇头移动到初始位置
head.goto(0, 0)
# 初始化蛇的移动方向
head.direction = "stop"

# 食物
food = turtle.Turtle()
# 设置绘制速度
food.speed(0)
# 设置食物形状
food.shape("circle")
# 设置食物颜色
food.color("red")
# 抬起画笔，移动时不绘制轨迹
food.penup()
# 随机生成食物的 x 坐标
x = random.randint(-290, 290)
# 随机生成食物的 y 坐标
y = random.randint(-290, 290)
# 将食物移动到随机位置
food.goto(x, y)

# 存储蛇的身体部分
segments = []

# 函数定义
def go_up():
    if head.direction != "down":
        head.direction = "up"

def go_down():
    if head.direction != "up":
        head.direction = "down"

def go_left():
    if head.direction != "right":
        head.direction = "left"

def go_right():
    if head.direction != "left":
        head.direction = "right"

def move():
    if head.direction == "up":
        y = head.ycor()
        head.sety(y + 20)
    elif head.direction == "down":
        y = head.ycor()
        head.sety(y - 20)
    elif head.direction == "left":
        x = head.xcor()
        head.setx(x - 20)
    elif head.direction == "right":
        x = head.xcor()
        head.setx(x + 20)

# 键盘绑定
wn.listen()
# 绑定 w 键到 go_up 函数
wn.onkeypress(go_up, "w")
# 绑定 s 键到 go_down 函数
wn.onkeypress(go_down, "s")
# 绑定 a 键到 go_left 函数
wn.onkeypress(go_left, "a")
# 绑定 d 键到 go_right 函数
wn.onkeypress(go_right, "d")

# 主游戏循环
while True:
    # 手动更新屏幕
    wn.update()

    # 检查边界碰撞
    if head.xcor() > 290 or head.xcor() < -290 or head.ycor() > 290 or head.ycor() < -290:
        # 游戏重置延迟
        time.sleep(1)
        # 将蛇头移动到初始位置
        head.goto(0, 0)
        # 重置蛇的移动方向
        head.direction = "stop"

        # 隐藏蛇的身体部分
        for segment in segments:
            segment.goto(1000, 1000)

        # 清空蛇的身体部分列表
        segments.clear()

    # 检查食物碰撞
    if head.distance(food) < 20:
        # 随机生成食物的 x 坐标
        x = random.randint(-290, 290)
        # 随机生成食物的 y 坐标
        y = random.randint(-290, 290)
        # 将食物移动到随机位置
        food.goto(x, y)

        # 添加新的蛇身体部分
        new_segment = turtle.Turtle()
        # 设置绘制速度
        new_segment.speed(0)
        # 设置身体部分形状
        new_segment.shape("square")
        # 设置身体部分颜色
        new_segment.color("grey")
        # 抬起画笔，移动时不绘制轨迹
        new_segment.penup()
        # 将新的身体部分添加到列表中
        segments.append(new_segment)

    # 反向移动蛇的身体部分
    for index in range(len(segments) - 1, 0, -1):
        x = segments[index - 1].xcor()
        y = segments[index - 1].ycor()
        segments[index].goto(x, y)

    # 移动第一个蛇身体部分到蛇头位置
    if len(segments) > 0:
        x = head.xcor()
        y = head.ycor()
        segments[0].goto(x, y)

    # 移动蛇头
    move()

    # 检查蛇头与身体部分的碰撞
    for segment in segments:
        if segment.distance(head) < 20:
            # 游戏重置延迟
            time.sleep(1)
            # 将蛇头移动到初始位置
            head.goto(0, 0)
            # 重置蛇的移动方向
            head.direction = "stop"

            # 隐藏蛇的身体部分
            for seg in segments:
                seg.goto(1000, 1000)

            # 清空蛇的身体部分列表
            segments.clear()

    # 控制游戏速度
    time.sleep(0.1)

"""
snake_game.py
├── 初始化模块
│   ├── 导入必要库 (turtle, time, random)
│   ├── 设置游戏窗口
│   ├── 初始化蛇头和食物
│   └── 初始化蛇的身体部分列表
├── 控制方法模块
│   ├── 控制蛇移动方向的方法 (go_up, go_down, go_left, go_right)
│   └── 蛇移动方法 (move)
└── 主循环模块
    ├── 绑定键盘事件
    ├── 处理边界碰撞和食物碰撞
    ├── 移动蛇的身体部分
    ├── 检查蛇头与身体的碰撞
    └── 控制游戏速度
"""
