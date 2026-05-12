async function loadAndRender() {
  const contentEl = document.getElementById('content');
  try {
    const response = await fetch('current-issue.md?t=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const markdown = await response.text();
    contentEl.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
  } catch (err) {
    contentEl.innerHTML = '<p>Could not load the latest issue. Try refreshing.</p>';
    console.error('Failed to load current-issue.md:', err);
  }
}

function exportToDoc() {
  const contentEl = document.getElementById('content');
  if (!contentEl || !contentEl.innerHTML.trim()) {
    alert('Issue not loaded yet — try again in a moment.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const filename = 'recruiting-wire-' + today + '.doc';

  const html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
    'xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8">' +
    '<title>The Recruiting Wire</title>' +
    '<style>' +
    'body { font-family: Georgia, "Times New Roman", serif; color: #1a1a1a; }' +
    'h1 { font-size: 24pt; }' +
    'h2 { font-size: 16pt; margin-top: 18pt; }' +
    'h3 { font-size: 13pt; }' +
    'a { color: #c8551e; }' +
    '</style></head><body>' +
    '<h1>The Recruiting Wire</h1>' +
    contentEl.innerHTML +
    '</body></html>';

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function() { URL.revokeObjectURL(url); }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
  loadAndRender();
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportToDoc);
});
