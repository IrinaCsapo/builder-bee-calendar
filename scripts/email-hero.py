"""
Draws the weekly email's hero as animated pictures: public/email/hero-0.gif … hero-5.gif.

Why pictures: Gmail's dark mode on phones flips text and background colours but never images, so a
hero drawn as an image looks exactly like the site's hero lab in light and dark mode alike.
One version per lab colour ("Find your next workshop" in orange, and so on); the email picks one per week.

Run once after changing the design (needs Pillow and the Newsreader font installed):
    python3 scripts/email-hero.py
"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'public' / 'email'
FONT = Path.home() / 'Library/Fonts/Newsreader-VariableFont_opsz,wght.ttf'
X = 2                      # drawn at 2x for sharp screens
W, H = 600 * X, 300 * X

# Same words and colours as the hero lab (src/components/Hero/Hero.tsx)
VARIANTS = [('hackathon', '#7B00DA'), ('workshop', '#FF6600'), ('buildathon', '#0006FA'),
            ('meetup', '#FE06E5'), ('bootcamp', '#21B700'), ('conference', '#009BE9')]

# ---- the honeycomb, same maths as src/components/HivePattern/wakeHive.ts ----
SQ3 = math.sqrt(3)
NORMALS = [(1, 0), (0.5, SQ3 / 2), (-0.5, SQ3 / 2)]

def honeycomb() -> Image.Image:
    size = 13 * X; cw = size * 0.66; ch = size * 0.82; R = 58 * X; wall = R * 0.3; dot = min(cw, ch) * 0.44
    def edge(px, py):
        q = (SQ3 / 3 * px - py / 3) / R; r = (2 / 3 * py) / R
        x, z = q, r; y = -x - z
        rx, ry, rz = round(x), round(y), round(z)
        dx, dy, dz = abs(rx - x), abs(ry - y), abs(rz - z)
        if dx > dy and dx > dz: rx = -ry - rz
        elif dy > dz: ry = -rx - rz
        else: rz = -rx - ry
        cx = R * SQ3 * (rx + rz / 2); cy = R * 1.5 * rz
        return R * SQ3 / 2 - max(abs((px - cx) * a + (py - cy) * b) for a, b in NORMALS)
    img = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(img)
    for j in range(int(H / ch) + 2):
        for i in range(int(W / cw) + 2):
            x = (i + 0.5 * (j & 1)) * cw; y = (j + 0.5) * ch
            m = 1 - edge(x, y - R) / wall
            if m <= 0: continue
            # fade out towards the bottom, so the picture runs smoothly into the white below it
            fade = min(1, (H - y) / (70 * X))
            rad = max(0.5 * X, dot * math.sqrt(m)) * max(fade, 0)
            if rad > 0.3: d.ellipse([x - rad, y - rad, x + rad, y + rad], fill='#ececf0')
    return img

# ---- pixel bees, from src/components/FlyingBee/FlyingBee.tsx ----
OPEN = ['....K...K....', '.....K.K.....', '.....KKK.....', '.WWW.KKK.WWW.', 'WWWWWYYYWWWWW', 'WWWWYYYYYWWWW',
        '.WWWKKKKKWWW.', '....YYYYY....', '....KKKKK....', '....YYYYY....', '.....YYY.....', '......K......']
CLOSED = ['....K...K....', '.....K.K.....', '.....KKK.....', '.....KKK.....', '...WWYYYWW...', '..WWYYYYYWW..',
          '..WWKKKKKWW..', '...WYYYYYW...', '....KKKKK....', '....YYYYY....', '.....YYY.....', '......K......']
COLOURS = {'K': (0, 0, 0, 255), 'Y': (255, 201, 60, 255), 'W': (255, 255, 255, 255)}

def bee(rows, px, angle) -> Image.Image:
    sp = Image.new('RGBA', (len(rows[0]), len(rows)), (0, 0, 0, 0))
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c in COLOURS: sp.putpixel((x, y), COLOURS[c])
    big = sp.resize((sp.width * px, sp.height * px), Image.NEAREST)
    pad = 8; cv = Image.new('RGBA', (big.width + 2 * pad, big.height + 2 * pad), (0, 0, 0, 0)); cv.alpha_composite(big, (pad, pad))
    rot = cv.rotate(angle, resample=Image.NEAREST, expand=True)
    a = rot.getchannel('A').point(lambda v: 255 if v else 0).filter(ImageFilter.MaxFilter(5))
    out = Image.new('RGBA', rot.size, (0, 0, 0, 0)); out.paste((26, 26, 26, 255), mask=a); out.alpha_composite(rot)
    return out

def font(size, opsz=72):
    f = ImageFont.truetype(str(FONT), size)
    try: f.set_variation_by_axes([400, opsz])   # axes: weight, optical size (like the site at large sizes)
    except Exception: pass
    return f

def draw(word: str, colour: str, base: Image.Image) -> Image.Image:
    img = base.copy().convert('RGBA'); d = ImageDraw.Draw(img)
    f = font(60 * X)
    line1, line2 = 'Find your next', word
    # Centre each line; the word gets the lab colour and an underline in the same colour
    for text, y, fill in ((line1, 108 * X, '#000000'), (line2, 176 * X, colour)):
        w = d.textlength(text, font=f)
        x = (W - w) / 2
        d.text((x, y), text, font=f, fill=fill, anchor='ls')
        if fill != '#000000':
            d.rectangle([x, y + 12 * X, x + w, y + 17 * X], fill=colour)
    return img

def frames(word, colour, base):
    still = draw(word, colour, base)
    out = []
    bob = [0, 2, 4, 6, 4, 2]
    for k in range(12):
        f = still.copy()
        rows = OPEN if k % 2 == 0 else CLOSED
        b1 = bee(rows, 12, -28); b2 = bee(rows, 10, 22)
        f.alpha_composite(b2, (W - b2.width - 14 * X, 4 * X + bob[k % 6]))
        f.alpha_composite(b1, (22 * X, 196 * X + bob[(k + 3) % 6]))
        out.append(f.convert('RGB').quantize(colors=64, method=Image.Quantize.MEDIANCUT))
    return out

if __name__ == '__main__':
    base = honeycomb()
    for i, (word, colour) in enumerate(VARIANTS):
        fr = frames(word, colour, base)
        path = OUT / f'hero-{i}.gif'
        fr[0].save(path, save_all=True, append_images=fr[1:], duration=110, loop=0, optimize=True, disposal=1)
        print(path.name, f'{path.stat().st_size // 1024} KB')
