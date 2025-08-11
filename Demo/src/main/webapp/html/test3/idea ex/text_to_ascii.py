from PIL import Image, ImageDraw, ImageFont
import art

# 将文字转为图像
text = "བོདན"
image = Image.new('RGB', (200, 100), color='white')
draw = ImageDraw.Draw(image)
# 使用绝对路径加载字体
font_path = r"e:\study\html\test3\idea ex\himalaya_0.ttf"
font = ImageFont.truetype(font_path, 20)
draw.text((10, 50), text, font=font, fill='black')

# 保存图像
image_path = 'text_image.png'
image.save(image_path)

# 保存图片路径到临时文件
with open('image_path.txt', 'w') as f:
    f.write(image_path)

# 使用 art 库生成 ASCII 艺术
ascii_art = art.text2art(text)
print(ascii_art)
