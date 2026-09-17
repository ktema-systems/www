// Geometry and colour of the two figures, in the spaces their sources use.
// The competition chart is read in SVG user units; the hero figure's colours are
// read as the computed values the browser resolved the tokens to.
(async () => {
  // getBBox depends on the font, so a probe that runs while the faces are still
  // loading measures the fallback and reports a box no reader ever sees.
  await document.fonts.ready;

  const round = (value) => Math.round(value * 100) / 100;
  const box = (node) => {
    const ink = node.getBBox();
    return { x: round(ink.x), y: round(ink.y), w: round(ink.width), h: round(ink.height) };
  };

  const chart = document.querySelector('#competition svg.chart');
  const band = chart.querySelector('.chart__band');
  const bandLabel = chart.querySelector('.chart__band-label');
  const panels = document.querySelector('.figure__panels');

  const root = getComputedStyle(document.documentElement);
  const token = (name) => root.getPropertyValue(name).trim();

  return {
    competition: {
      viewBox: chart.getAttribute('viewBox'),
      rect: (() => {
        const ink = chart.getBoundingClientRect();
        return { left: round(ink.left), top: round(ink.top), width: round(ink.width) };
      })(),
      band: {
        x: Number(band.getAttribute('x')),
        y: Number(band.getAttribute('y')),
        w: Number(band.getAttribute('width')),
        h: Number(band.getAttribute('height')),
      },
      bandLabel: {
        text: bandLabel.textContent.trim(),
        html: bandLabel.outerHTML,
        ...box(bandLabel),
        style: (() => {
          const computed = getComputedStyle(bandLabel);
          return {
            paintOrder: computed.paintOrder,
            stroke: computed.stroke,
            strokeWidth: computed.strokeWidth,
            fill: computed.fill,
          };
        })(),
      },
      grid: (() => {
        const computed = getComputedStyle(chart.querySelector('.chart__grid'));
        return { stroke: computed.stroke, dash: computed.strokeDasharray };
      })(),
      bandLabelMask: (() => {
        const mask = chart.querySelector('.chart__band-mask');
        if (!mask) return null;
        const geometry = {
          x: Number(mask.getAttribute('x')),
          y: Number(mask.getAttribute('y')),
          w: Number(mask.getAttribute('width')),
          h: Number(mask.getAttribute('height')),
        };
        const ink = box(bandLabel);
        const rules = [...chart.querySelectorAll('.chart__grid')].map((line) =>
          Number(line.getAttribute('y1')),
        );
        return {
          ...geometry,
          paintAfterGrid: !!(
            mask.compareDocumentPosition(chart.querySelector('.chart__grid')) &
            Node.DOCUMENT_POSITION_PRECEDING
          ),
          paintBeforeLabel: !!(
            mask.compareDocumentPosition(bandLabel) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
          coversLabel: geometry.x <= ink.x && ink.x + ink.w <= geometry.x + geometry.w,
          coversRules: rules
            .filter((y) => ink.y <= y && y <= ink.y + ink.h)
            .every((y) => geometry.y <= y && y <= geometry.y + geometry.h),
        };
      })(),
      bandLabelClashes: (() => {
        const ink = box(bandLabel);
        const overlaps = (a, b) =>
          a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        return [...chart.querySelectorAll('text, circle')]
          .filter((node) => node !== bandLabel)
          .map((node) => ({ text: node.textContent.trim().slice(0, 24), ink: box(node) }))
          .filter((entry) => overlaps(ink, entry.ink))
          .map((entry) => entry.text);
      })(),
      tokens: { line: token('--line'), line2: token('--line-2'), panel: token('--panel') },
      texts: [...chart.querySelectorAll('text')].map((node) => ({
        cls: node.getAttribute('class') || '',
        text: node.textContent.trim(),
        ...box(node),
      })),
      circles: [...chart.querySelectorAll('circle')].map((node) => ({
        cx: round(Number(node.getAttribute('cx'))),
        cy: round(Number(node.getAttribute('cy'))),
        r: Number(node.getAttribute('r')),
      })),
    },
    figure: {
      tokens: {
        accent: token('--accent'),
        fg: token('--fg'),
        fg2: token('--fg-2'),
        fg3: token('--fg-3'),
        panel: token('--panel'),
      },
      fills: Object.fromEntries(
        [
          ['barStrong', '.fig-bar-strong'],
          ['barSoft', '.fig-bar-soft'],
          ['dotMatch', '.fig-dot-match circle'],
          ['dotOther', '.fig-dot-other circle'],
          ['query', '.fig-query'],
          ['accentLabel', '.fig-accent'],
          ['column', '.fig-column'],
          ['axis', '.fig-axis'],
          ['indexHatch', '.fig-hatch'],
          ['rowLabel', '.fig-row-label'],
        ].map(([name, selector]) => {
          const node = panels.querySelector(selector);
          return [name, node ? getComputedStyle(node).fill : null];
        }),
      ),
    },
    // What the page actually loaded, so a rule that reads as absent from the
    // cascade can be told apart from a stylesheet that never arrived.
    loadedSheets: [...document.styleSheets].map((sheet) => {
      let rules = [];
      try {
        rules = [...sheet.cssRules].map((rule) => rule.cssText);
      } catch (error) {
        rules = ['unreadable: ' + error];
      }
      return {
        href: sheet.href,
        rules: rules.length,
        matching: rules.filter((rule) => rule.includes('paint-order') || rule.includes('band-label')),
      };
    }),
    heroCopy: ['.hero__lede', '.hero__body'].map((selector) => {
      const node = document.querySelector(selector);
      const ink = node.getBoundingClientRect();
      return {
        selector,
        top: round(ink.top),
        bottom: round(ink.bottom),
        left: round(ink.left),
        right: round(ink.right),
      };
    }),
  };
})()
