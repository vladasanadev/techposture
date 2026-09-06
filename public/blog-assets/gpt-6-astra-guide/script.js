(function () {
  const toast = document.getElementById('toast');

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('show'), 1500);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        return fallbackCopy(text);
      }
    }

    return fallbackCopy(text);
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('.copybtn');
    if (!button) return;
    const block = button.closest('.codeblock');
    const code = block && block.querySelector('code');
    const text = code ? code.textContent.trim() : '';
    if (!text) return;

    const ok = await copyText(text);
    if (!ok) {
      showToast('Copy failed, select manually');
      return;
    }

    const original = button.textContent;
    button.textContent = 'Copied';
    showToast('Copied');
    setTimeout(() => {
      button.textContent = original;
    }, 1200);
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 68, behavior: 'smooth' });
  });
})();
