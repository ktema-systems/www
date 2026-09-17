"""Worst-case contrast for body text over the hero's field."""

import sys

import numpy as np
from PIL import Image


def luminance(rgb):
    channel = np.array(rgb, dtype=float) / 255.0
    channel = np.where(channel <= 0.03928, channel / 12.92, ((channel + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2]


def contrast(a, b):
    high, low = max(luminance(a), luminance(b)), min(luminance(a), luminance(b))
    return (high + 0.05) / (low + 0.05)


page = np.array([19, 18, 16])
image = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
copy = image[230:470, 180:950]
delta = np.abs(copy - page).sum(axis=2)
# The field is drawn in the accent, so it is the pixels with blue over red; the text
# and its antialiasing are neutral and would otherwise dominate the tail.
tinted = (copy[..., 2] - copy[..., 0]) >= 20
strokes = copy[tinted & (delta > 12)]
print('tinted field pixels behind the copy: %d px' % len(strokes))

for label, value in (
    ('median', np.median(strokes, axis=0)),
    ('p99', np.percentile(strokes, 99, axis=0)),
    ('max', strokes.max(axis=0)),
):
    rgb = tuple(int(x) for x in value)
    print('   %-7s %-16s  --fg-2 body text over it: %.2f:1   --fg headline over it: %.2f:1'
          % (label, str(rgb), contrast(rgb, (190, 189, 187)), contrast(rgb, (250, 249, 247))))
