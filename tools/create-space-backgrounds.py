"""Generate small local decorative SVG backdrops, never scientific evidence."""
from pathlib import Path
from random import Random
from math import cos, sin, pi, sqrt

out = Path('assets/artwork')
out.mkdir(exist_ok=True)
rng = Random(2718)
stars = ''.join(f'<circle cx="{rng.randrange(1600)}" cy="{rng.randrange(520)}" r="{rng.choice([.5,.7,1,1.3])}" fill="{rng.choice(["#b8d6ff","#6ec8ed","#f7d4b0"])}" opacity="{rng.uniform(.2,.8):.2f}"/>' for _ in range(230))
defs = '''<defs>
<radialGradient id="cloud"><stop stop-color="#4bc5dc" stop-opacity=".75"/><stop offset=".45" stop-color="#224777" stop-opacity=".6"/><stop offset="1" stop-color="#091426" stop-opacity="0"/></radialGradient>
<radialGradient id="amber"><stop stop-color="#ffc69d" stop-opacity=".9"/><stop offset=".28" stop-color="#a66b69" stop-opacity=".6"/><stop offset="1" stop-color="#102441" stop-opacity="0"/></radialGradient>
<radialGradient id="planet" cx=".26" cy=".15"><stop stop-color="#a3c6d9"/><stop offset=".18" stop-color="#375375"/><stop offset=".58" stop-color="#0d1b31"/><stop offset="1" stop-color="#020610"/></radialGradient>
<radialGradient id="earth" cx=".35" cy=".3"><stop stop-color="#8cbcd7"/><stop offset=".28" stop-color="#1d648e"/><stop offset=".65" stop-color="#072842"/><stop offset="1" stop-color="#010915"/></radialGradient>
<filter id="nebula" x="-30%" y="-50%" width="160%" height="200%"><feTurbulence type="fractalNoise" baseFrequency=".006 .014" numOctaves="3" seed="19" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="140"/><feGaussianBlur stdDeviation="8"/></filter>
<filter id="glow"><feGaussianBlur stdDeviation="9"/></filter>
<linearGradient id="rock" x2="0" y2="1"><stop stop-color="#60718b"/><stop offset="1" stop-color="#07101f"/></linearGradient>
</defs>'''

def galaxy(cx, cy, angle, blue=False):
    parts = [f'<g transform="translate({cx} {cy}) rotate({angle})">']
    parts += ['<ellipse rx="310" ry="155" fill="url(#cloud)"/>']
    dust = Random(92 if blue else 17)
    for i in range(1050):
        radius = 270 * sqrt(dust.random())
        theta = (i % 3) * pi * 2 / 3 + radius * .024 + dust.gauss(0, .2)
        x, y = radius * cos(theta) * 1.2, radius * sin(theta) * .48
        color = dust.choice(['#78b5df', '#b4d2e7', '#667aaa', '#9eb4cf'] if blue else ['#9caad5','#c8b8bd','#d0aa88','#708ab7'])
        parts += [f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{dust.uniform(.6,3.7):.1f}" ry="{dust.uniform(.4,1.6):.1f}" fill="{color}" opacity="{dust.uniform(.12,.55):.2f}"/>']
    parts += ['<ellipse rx="145" ry="70" fill="url(#amber)"/><ellipse rx="29" ry="14" fill="#f5d2b2" opacity=".65" filter="url(#glow)"/></g>']
    return ''.join(parts)

scenes = {}
scenes['explorer'] = '<g filter="url(#nebula)"><ellipse cx="1130" cy="210" rx="440" ry="260" fill="url(#cloud)"/><ellipse cx="1190" cy="170" rx="250" ry="270" fill="url(#amber)"/><ellipse cx="820" cy="270" rx="200" ry="190" fill="url(#cloud)"/></g>'
scenes['compare'] = '<ellipse cx="1160" cy="260" rx="450" ry="240" fill="url(#cloud)" opacity=".4"/><circle cx="1190" cy="265" r="205" fill="url(#planet)" stroke="#668caf" stroke-width="1.5"/><ellipse cx="1130" cy="280" rx="365" ry="102" fill="none" stroke="#b89b80" stroke-width="2" opacity=".65" transform="rotate(-24 1130 280)"/><circle cx="1465" cy="420" r="130" fill="url(#planet)"/><path d="M1040 128Q1200 20 1340 114" fill="none" stroke="#b0dbef" opacity=".6"/>'
scenes['coverage'] = galaxy(1190,235,-22) + '<g stroke="#3e7aa6" opacity=".17">' + ''.join(f'<path d="M{x} 0V520"/>' for x in range(700,1600,80)) + ''.join(f'<path d="M700 {y}H1600"/>' for y in range(40,520,80)) + '</g>'
scenes['evidence'] = '<circle cx="1150" cy="545" r="390" fill="url(#earth)" stroke="#9bccea" stroke-width="3"/><path d="M850 340Q1000 255 1270 330T1540 420M880 390Q1200 350 1400 475" fill="none" stroke="#b6d8e9" stroke-width="20" opacity=".18"/><path d="M690 0L760 430 1520 430 1610 0" fill="none" stroke="#060d16" stroke-width="68"/><path d="M690 0L760 430 1520 430 1610 0" fill="none" stroke="#3e536e" stroke-width="3"/><path d="M1025 0L980 430M690 160L1580 160" stroke="#121d2c" stroke-width="22"/>'
scenes['record'] = '<circle cx="1170" cy="100" r="76" fill="url(#earth)" stroke="#6b9dc2"/><path d="M0 430L170 390 320 417 460 348 590 395 730 305 820 345 920 285 1100 349 1230 290 1370 338 1460 290 1600 360V520H0Z" fill="url(#rock)"/><path d="M640 456L820 370 960 438 1120 363 1380 457" fill="none" stroke="#8e9cab" opacity=".3" stroke-width="3"/>'
scenes['data-notes'] = galaxy(1190,205,-34,True) + '<g filter="url(#nebula)"><ellipse cx="830" cy="240" rx="240" ry="140" fill="url(#cloud)" opacity=".5"/></g><path d="M0 500L400 430 730 460 980 350 1190 460 1420 390 1600 445V520H0" fill="#030913"/>'
for name, scene in scenes.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 520"><title>Decorative {name} space artwork, not experiment imagery</title>{defs}<rect width="1600" height="520" fill="#030a15"/>{stars}{scene}</svg>'
    (out / f'{name}-space.svg').write_text(svg, encoding='utf-8')
print('Generated six decorative local SVG backgrounds')
