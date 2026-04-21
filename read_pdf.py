from pypdf import PdfReader
from PIL import Image
import io

r = PdfReader(r'C:\Users\carlo\estudearquiteto\.agents\front_exemple.pdf')
page = r.pages[0]

xobj = page['/Resources']['/XObject']['/Image1']
data = xobj.get_data()

if xobj.get('/Subtype') == '/Image':
    if '/DCTDecode' in str(xobj.get('/Filter')):
        img = Image.open(io.BytesIO(data))
        img.save(r'C:\Users\carlo\estudearquiteto\output.png')
        print('Image saved to output.png')
    elif '/FlateDecode' in str(xobj.get('/Filter')):
        width = xobj.get('/Width')
        height = xobj.get('/Height')
        colorspace = xobj.get('/ColorSpace')
        bits = xobj.get('/BitsPerComponent')
        print(f'Raw image: {width}x{height}, {colorspace}, {bits} bits')