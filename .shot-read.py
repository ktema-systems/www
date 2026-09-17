"""Read a screenshot the way an eye would: where the ink is, and whether the
masthead paints anything of its own at the top of the page."""

import sys

import numpy as np
from PIL import Image


def unpack(value):
    return tuple(int(x) for x in int(value).to_bytes(3, 'big'))


path = sys.argv[1]
image = np.asarray(Image.open(path).convert('RGB')).astype(int)
height, width, _ = image.shape

packed = image[..., 0] * 65536 + image[..., 1] * 256 + image[..., 2]
counts = np.bincount(packed.ravel())
background = unpack(counts.argmax())
print('size %dx%d  background %s' % (width, height, background))

print('most common colours:')
for value in np.argsort(counts)[::-1][:5]:
    if counts[value] == 0:
        continue
    print('   %-16s %8d px  %.2f%%' % (str(unpack(value)), counts[value], 100.0 * counts[value] / packed.size))

bg = np.array(background)
ink = np.abs(image - bg).sum(axis=2) > 6

print()
print('bands of rows carrying ink:')
row = ink.any(axis=1)
start = None
for y in range(height):
    if row[y] and start is None:
        start = y
    elif not row[y] and start is not None:
        print('   %4d..%-4d  (%d rows)' % (start, y - 1, y - start))
        start = None
if start is not None:
    print('   %4d..%-4d  (to the bottom)' % (start, height - 1))

print()
print('column extent of the ink in the top 100 rows:')
for y in range(0, 100, 5):
    changed = np.where(ink[y])[0]
    if len(changed) == 0:
        print('   y=%-3d  nothing' % y)
    else:
        print('   y=%-3d  x=%d..%d  %d px' % (y, changed[0], changed[-1], len(changed)))

print()
print('background check down the right edge, across the bar boundary at y=72:')
for y in range(48, 100, 4):
    print('   y=%-3d  %s' % (y, tuple(image[y, width - 8])))

print()
print('row-to-row change, whole width (a rule or a band shows as a spike):')
strip = np.abs(np.diff(image, axis=0)).sum(axis=(1, 2)) / (width * 3)
for y in range(0, 140):
    if strip[y] > 0.5:
        print('   y=%3d -> %3d   mean change %.3f' % (y, y + 1, strip[y]))
