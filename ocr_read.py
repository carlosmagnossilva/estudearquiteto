import easyocr

reader = easyocr.Reader(['pt', 'en'])
result = reader.readtext(r'C:\Users\carlo\estudearquiteto\output.png', detail=0)

print('\n'.join(result))