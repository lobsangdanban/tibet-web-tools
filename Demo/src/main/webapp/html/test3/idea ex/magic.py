from ascii_magic import AsciiArt

my_art = AsciiArt.from_image('your_image.jpg')
print(my_art.to_ascii(columns=100))