"""
Draws public/og-image.jpg, the 1200x630 picture shown when a BuilderBee link is shared (LinkedIn,
WhatsApp, Slack…), in the hero's style: white with the dotted honeycomb, "Find your next hackathon" with
the purple word and underline, and two pixel bees. Reuses the drawing code of scripts/email-hero.py.

Run once after changing the design (needs Pillow and the Newsreader font installed):
    python3 scripts/og-image.py
"""
import importlib.util
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('email_hero', HERE / 'email-hero.py')
eh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(eh)

W, H = 1200, 630
eh.X, eh.W, eh.H = 2, W, H          # the honeycomb at the same scale as the site on a big screen
PURPLE = '#7B00DA'

img = eh.honeycomb().convert('RGBA')
d = ImageDraw.Draw(img)

# Logo on its white badge, top left
logo = Image.open(HERE.parent / 'public' / 'email' / 'logo-badge.png').convert('RGBA')
logo = logo.resize((300, round(300 * logo.height / logo.width)), Image.LANCZOS)
img.alpha_composite(logo, (40, 34))

# Headline: two centred lines, the word in purple with a purple underline
big = eh.font(128)
for text, y, fill in (('Find your next', 262, '#000000'), ('hackathon', 398, PURPLE)):
    w = d.textlength(text, font=big)
    x = (W - w) / 2
    d.text((x, y), text, font=big, fill=fill, anchor='ls')
    if fill == PURPLE:
        d.rectangle([x, y + 22, x + w, y + 32], fill=PURPLE)

# Subtitle
small = eh.font(32, opsz=16)
for i, line in enumerate(['Hackathons, workshops and meetups for women, non-binary', 'people and allies in tech. Online and around the world.']):
    w = d.textlength(line, font=small)
    d.text(((W - w) / 2, 506 + i * 42), line, font=small, fill='#1a1a1a', anchor='ls')

# Two bees, like the hero
b1 = eh.bee(eh.OPEN, 9, 22)
b2 = eh.bee(eh.OPEN, 7, -28)
img.alpha_composite(b1, (W - b1.width - 50, 30))
img.alpha_composite(b2, (70, 300))   # left of the purple word

out = HERE.parent / 'public' / 'og-image.jpg'
img.convert('RGB').save(out, quality=88, optimize=True)
print(out, f'{out.stat().st_size // 1024} KB')
