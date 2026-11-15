// One roll for every number a deck shows. A counter marks its target with
// `data-count` and its decimals with `data-decimals`; a deck calls `rollAll` when the
// panel becomes active, so a number arrives the same way everywhere.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const formatNumber = (value: number, decimals = 0) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const rollNumber = (element: HTMLElement, duration = 900) => {
  const target = Number(element.dataset.count ?? '');
  if (!Number.isFinite(target)) return;

  const decimals = Number(element.dataset.decimals ?? 0);
  if (reduced()) {
    element.textContent = formatNumber(target, decimals);
    return;
  }

  const started = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / duration);
    element.textContent = formatNumber(target * easeOut(t), decimals);
    if (t < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

export const rollAll = (root: ParentNode, duration = 900) => {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
    rollNumber(element, duration);
  });
};

export const resetAll = (root: ParentNode) => {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
    element.textContent = formatNumber(0, Number(element.dataset.decimals ?? 0));
  });
};
