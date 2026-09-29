from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGB', (400, 200), color = (73, 109, 137))
d = ImageDraw.Draw(img)
d.text((10,10), "This is a test image for OCR.", fill=(255,255,0))
d.text((10,50), "It should extract this text correctly.", fill=(255,255,0))
d.text((10,90), "SnapExplain requires at least thirty characters to analyze properly.", fill=(255,255,0))

img.save('test_ocr.png')
