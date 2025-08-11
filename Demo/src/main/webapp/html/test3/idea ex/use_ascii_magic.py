from ascii_magic import AsciiArt

# 使用原始字符串避免转义问题
image_path = r'e:\study\html\test3\idea ex\01.png'

# 从图像创建 AsciiArt 对象
my_art = AsciiArt.from_image(image_path)

# 打印 ASCII 艺术
print(my_art.to_ascii(columns=100))