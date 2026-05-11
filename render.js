async function loadAndRender() {
  const contentEl = document.getElementById('content');
  try {
    const response = await fetch('current-issue.md?t=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const markdown = await response.text();
    contentEl.innerHTML = marked.parse(markdown);
  } catch (err) {
    contentEl.innerHTML = '<p>Could not load the latest issue. Try refreshing.</p>';
    console.error('Failed to load current-issue.md:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadAndRender);
