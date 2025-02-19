// Initialize the UI elements
let container, header, title, modelInfo, content, actions;

function initializeUI() {
  if (document.getElementById('ai-swiss-army-knife-container')) {
    return; // UI already initialized
  }

  // Create container
  container = document.createElement('div');
  container.id = 'ai-swiss-army-knife-container';
  container.className = 'ai-swiss-army-knife-container';

  // Create header
  header = document.createElement('div');
  header.className = 'ai-swiss-army-knife-header';

  title = document.createElement('h3');
  title.className = 'ai-swiss-army-knife-title';

  modelInfo = document.createElement('span');
  modelInfo.className = 'ai-swiss-army-knife-model';

  const closeButton = document.createElement('button');
  closeButton.className = 'ai-swiss-army-knife-close';
  closeButton.textContent = '×';
  closeButton.title = 'Close';

  header.appendChild(title);
  header.appendChild(modelInfo);
  header.appendChild(closeButton);

  // Create content area
  content = document.createElement('div');
  content.className = 'ai-swiss-army-knife-content';

  // Create actions area
  actions = document.createElement('div');
  actions.className = 'ai-swiss-army-knife-actions';

  const actionButtons = [
    {
      name: 'Copy',
      icon: '📋',
      primary: false,
      handler: copyContent
    },
    {
      name: 'Save',
      icon: '💾',
      primary: false,
      handler: saveContent
    },
    {
      name: 'Regenerate',
      icon: '🔄',
      primary: true,
      handler: regenerateContent
    }
  ].map(createActionButton);

  actionButtons.forEach(button => actions.appendChild(button));

  // Assemble the UI
  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(actions);

  document.body.appendChild(container);

  // Add event listeners
  closeButton.addEventListener('click', hideContainer);
  document.addEventListener('keydown', handleKeyPress);
}

// Button creation helper
function createActionButton({ name, icon, primary, handler }) {
  const button = document.createElement('button');
  button.className = `ai-swiss-army-knife-button${primary ? ' primary' : ''}`;
  button.innerHTML = `${icon} <span>${name}</span>`;
  button.addEventListener('click', handler);
  return button;
}

// Action handlers
async function copyContent() {
  const button = this;
  try {
    await navigator.clipboard.writeText(content.textContent);
    updateButtonText(button, 'Copied!', '✓');
  } catch (err) {
    console.error('Failed to copy text:', err);
    updateButtonText(button, 'Failed', '❌');
  }
}

function saveContent() {
  const button = this;
  try {
    const text = content.textContent;
    const type = title.textContent.toLowerCase().replace(/\s+/g, '-');
    const filename = `ai-${type}-${new Date().toISOString().slice(0,10)}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    updateButtonText(button, 'Saved!', '✓');
  } catch (err) {
    console.error('Failed to save:', err);
    updateButtonText(button, 'Failed', '❌');
  }
}

function regenerateContent() {
  // Signal background script to regenerate content
  chrome.runtime.sendMessage({
    action: 'regenerate',
    previousContent: content.textContent,
    type: currentTaskType
  });
}

// UI Helpers
function updateButtonText(button, text, icon = null) {
  const originalText = button.innerHTML;
  button.innerHTML = `${icon ? icon + ' ' : ''}<span>${text}</span>`;
  setTimeout(() => {
    button.innerHTML = originalText;
  }, 2000);
}

function hideContainer() {
  container.style.display = 'none';
  resetContent();
}

function resetContent() {
  content.className = 'ai-swiss-army-knife-content';
  content.textContent = '';
  modelInfo.textContent = '';
}

function handleKeyPress(e) {
  if (e.key === 'Escape' && container.style.display !== 'none') {
    hideContainer();
  }
}

// Task type to title mapping
const TASK_TITLES = {
  email: { title: 'Generated Email', icon: '📧' },
  blogPost: { title: 'Blog Post', icon: '📝' },
  summarize: { title: 'Summary', icon: '📋' },
  reply: { title: 'Generated Reply', icon: '↩️' },
  tweet: { title: 'Social Media Post', icon: '🐦' },
  technical: { title: 'Technical Document', icon: '📄' },
  academic: { title: 'Academic Paper', icon: '🎓' },
  code: { title: 'Generated Code', icon: '💻' },
  translate: { title: 'Translation', icon: '🌐' },
  analyze: { title: 'Analysis', icon: '📊' },
  research: { title: 'Research', icon: '🔍' },
  meetings: { title: 'Meeting Notes', icon: '📅' },
  proofread: { title: 'Proofreading', icon: '✍️' },
  cite: { title: 'Citations', icon: '📚' }
};

let currentTaskType = null;

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  initializeUI();

  switch (message.action) {
    case 'showLoading':
      showLoading(message.taskType);
      break;

    case 'showResult':
      showResult(message.result, message.type, message.model);
      break;

    case 'updateStreamingResult':
      updateStreamingResult(message.content, message.type);
      break;

    case 'showError':
      showError(message.error);
      break;
  }
});

function showLoading(taskType) {
  currentTaskType = taskType;
  container.style.display = 'block';
  
  const taskInfo = TASK_TITLES[taskType] || { title: 'Processing', icon: '⚙️' };
  title.innerHTML = `${taskInfo.icon} ${taskInfo.title}`;
  modelInfo.textContent = 'Selecting best model...';
  content.className = 'ai-swiss-army-knife-content loading';
  content.textContent = '';
}

function showResult(result, type, model) {
  currentTaskType = type;
  container.style.display = 'block';
  
  const taskInfo = TASK_TITLES[type] || { title: 'Result', icon: '✨' };
  title.innerHTML = `${taskInfo.icon} ${taskInfo.title}`;
  modelInfo.textContent = `Using ${model}`;
  
  content.className = 'ai-swiss-army-knife-content';
  
  // Handle different content types
  if (typeof result === 'object') {
    if (type === 'code') {
      content.innerHTML = formatCodeResult(result);
    } else {
      content.innerHTML = formatStructuredResult(result);
    }
  } else {
    content.textContent = result;
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateStreamingResult(streamContent, type) {
  currentTaskType = type;
  
  if (container.style.display === 'none') {
    showLoading(type);
  }
  
  content.className = 'ai-swiss-army-knife-content ai-swiss-army-knife-stream';
  content.textContent = streamContent;
}

function showError(error) {
  container.style.display = 'block';
  title.innerHTML = '❌ Error';
  modelInfo.textContent = '';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ai-swiss-army-knife-error';
  errorDiv.textContent = error;
  
  content.className = 'ai-swiss-army-knife-content';
  content.innerHTML = '';
  content.appendChild(errorDiv);
}

// Content formatters
function formatCodeResult(result) {
  const { code, language, explanation } = result;
  return `
    <div class="code-block">
      <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
      ${explanation ? `<div class="code-explanation">${explanation}</div>` : ''}
    </div>
  `;
}

function formatStructuredResult(result) {
  return `
    <div class="structured-result">
      ${Object.entries(result).map(([key, value]) => `
        <div class="result-item">
          <strong>${key}:</strong>
          <span>${formatValue(value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return `<ul>${value.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
  return escapeHtml(value);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
