"""How visible is the hero's field behind the menu, band by band."""

import sys

import numpy as np
from PIL import Image

image = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
page = np.array([19, 18, 16])
delta = np.abs(image - page).sum(axis=2)

for start in range(0, 216, 72):
    band = delta[start:start + 72]
    print('rows %3d..%3d  max delta %4d   px over 30: %5d   px over 60: %5d'
          % (start, start + 71, band.max(), int((band > 30).sum()), int((band > 60).sum())))

strong = np.argwhere(delta[0:72] > 60)
print('strongest pixels behind the menu: %d' % len(strong))
for y, x in strong[:5]:
    print('   (%3d, %4d) is %s' % (y, x, tuple(image[y, x])))
