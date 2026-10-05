import math
import pathlib
import subprocess

from PIL import Image

OUT = pathlib.Path(__file__).resolve().parent
SIZE = 1024
ORANGE = "#F36404"
BG = "#000000"
REACT_BLUE = "#61DAFB"

R_OUTER = 430
R_INNER = R_OUTER * 0.823
CX = SIZE / 2
CY = SIZE / 2 + R_OUTER * (1 - math.cos(math.pi / 7)) / 2


def heptagon(r, start_deg):
    pts = []
    for k in range(7):
        a = math.radians(start_deg + k * 360 / 7)
        pts.append(f"{CX + r * math.cos(a):.2f},{CY + r * math.sin(a):.2f}")
    return "M" + " L".join(pts) + " Z"


FRAME = (
    f'<path fill="{ORANGE}" fill-rule="evenodd" '
    f'd="{heptagon(R_OUTER, -90)} {heptagon(R_INNER, 90)}"/>'
)

SWIFT_BIRD = (
    "M13.543 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001"
    "c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158"
    "l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838"
    "c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191"
    "a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86"
    "c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668"
    ".708-2.588-.09-5.548-1.893-7.992z"
)

# Regal R in a 214x155 box, traced from the brand mark
R_W, R_H, R_SCALE = 214, 155, 1.6
R_GLYPH = (
    f'<g transform="translate({CX + 6} {CY}) scale({R_SCALE}) translate({-R_W / 2} {-R_H / 2})">'
    f'<path fill="{ORANGE}" fill-rule="evenodd" d="'
    "M0,0 L160,0 C198,0 214,18 214,52 C214,86 198,105 160,105 L152,105 L214,155 L154,155 "
    "L94,105 L44,105 L44,155 L0,155 Z "
    'M44,37 L150,37 C164,37 170,43 170,55 C170,67 164,73 150,73 L44,73 Z"/></g>'
)

# Badge must stay inside the iOS squircle mask and clear of the R's leg
BADGE_X, BADGE_Y, BADGE_R = 800, 800, 140


def badge(mark):
    return (
        f'<circle cx="{BADGE_X}" cy="{BADGE_Y}" r="{BADGE_R}" fill="{BG}"/>'
        f'<circle cx="{BADGE_X}" cy="{BADGE_Y}" r="{BADGE_R - 18}" fill="none" '
        f'stroke="{ORANGE}" stroke-width="12"/>'
        f'<g transform="translate({BADGE_X} {BADGE_Y})">{mark}</g>'
    )


# Swift bird bbox in 24-unit space: x 0.5..20.6, y 3.41..20.6
SWIFT = (
    '<g transform="scale(7.6) translate(-10.55 -12.0)">'
    f'<path fill="{ORANGE}" d="{SWIFT_BIRD}"/></g>'
)

REACT = (
    f'<g transform="scale(7.4)" fill="none" stroke="{REACT_BLUE}" stroke-width="1.3">'
    f'<circle r="2.1" fill="{REACT_BLUE}" stroke="none"/>'
    '<ellipse rx="11" ry="4.2"/>'
    '<ellipse rx="11" ry="4.2" transform="rotate(60)"/>'
    '<ellipse rx="11" ry="4.2" transform="rotate(120)"/>'
    "</g>"
)


def svg(mark):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" '
        f'viewBox="0 0 {SIZE} {SIZE}"><rect width="{SIZE}" height="{SIZE}" fill="{BG}"/>'
        f"{FRAME}{R_GLYPH}{badge(mark)}</svg>"
    )


for name, mark in (("regal-swift-icon", SWIFT), ("regal-expo-icon", REACT)):
    src = OUT / f"{name}.svg"
    src.write_text(svg(mark))
    subprocess.run(
        ["qlmanage", "-t", "-s", str(SIZE), "-o", str(OUT), str(src)],
        check=True,
        capture_output=True,
    )
    rendered = OUT / f"{name}.svg.png"
    img = Image.open(rendered).convert("RGBA")
    flat = Image.new("RGB", img.size, BG)
    flat.paste(img, mask=img.split()[3])
    flat = flat.resize((SIZE, SIZE), Image.LANCZOS)
    flat.save(OUT / f"{name}.png")
    rendered.unlink()
    print(name, flat.size, flat.mode)
