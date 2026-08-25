document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy-target]');
  if (!button) return;

  const target = document.getElementById(button.dataset.copyTarget);
  if (!target) return;

  const text = target.textContent.trim();

  try {
    await navigator.clipboard.writeText(text);
    const label = button.querySelector('.copy-label');
    if (label) label.textContent = 'Copied';
    window.setTimeout(() => {
      if (label) label.textContent = 'Copy';
    }, 1400);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
});
