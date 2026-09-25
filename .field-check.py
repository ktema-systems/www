"""How strongly the hero's field reads, by region, and whether its lower edge is a
hard cut or a melt."""

import sys

import numpy as np
from PIL import Image

image = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
height, width, _ = image.shape
page = np.array([19, 18, 16])
delta = np.abs(image - page).sum(axis=2)

regions = (
    ('left, under the copy', 150, 650, 200, 420),
    ('right, open side', 900, 1400, 200, 420),
    ('lower left', 150, 650, 420, 640),
    ('lower right', 900, 1400, 420, 640),
)
for label, x0, x1, y0, y1 in regions:
    band = delta[y0:y1, x0:x1]
    print('%-22s  strokes over 20: %6d px   mean %5.2f   p99 %5.1f   max %3d'
          % (label, int((band > 20).sum()), band.mean(), np.percentile(band, 99), band.max()))

print()
print('brightest field pixel per quarter of the page width, rows 200..640:')
for x0 in range(0, width, width // 4):
    band = delta[200:640, x0:x0 + width // 4]
    print('   x %4d..%-4d  p99 %5.1f  max %3d' % (x0, x0 + width // 4, np.percentile(band, 99), band.max()))

print()
print('row-to-row change down a column through the field (a hard edge shows as a spike):')
column = delta[:, 1000:1060].mean(axis=1)
for y in range(1, min(height, 900)):
    if column[y] - column[y - 1] > 2.0 or column[y - 1] - column[y] > 2.0:
        print('   y=%3d -> %3d   %.2f -> %.2f' % (y - 1, y, column[y - 1], column[y]))
