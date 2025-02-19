document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const defaultModelInput = document.getElementById('defaultModel');
  const modelSuggestions = document.getElementById('modelSuggestions');
  const saveButton = document.getElementById('saveButton');
  const statusMessage = document.getElementById('statusMessage');

  let availableModels = [];
  let modelValidationTimeout;

  // Load saved settings
  chrome.storage.sync.get(['apiKey', 'defaultModel'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    if (result.defaultModel) {
      defaultModelInput.value = result.defaultModel;
    }
  });

  // Fetch available models when popup opens
  fetchAvailableModels();

  // Handle model input with debouncing
  defaultModelInput.addEventListener('input', () => {
    clearTimeout(modelValidationTimeout);
    modelValidationTimeout = setTimeout(() => {
      const input = defaultModelInput.value.trim().toLowerCase();
      if (input) {
        showModelSuggestions(input);
      } else {
        hideModelSuggestions();
      }
    }, 300);
  });

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!modelSuggestions.contains(e.target) && e.target !== defaultModelInput) {
      hideModelSuggestions();
    }
  });

  // Save settings
  saveButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const defaultModel = defaultModelInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-or-')) {
      showStatus('Invalid API key format. Should start with "sk-or-"', 'error');
      return;
    }

    // Validate model
    if (!defaultModel) {
      showStatus('Please enter a default model', 'error');
      return;
    }

    const isValidModel = await validateModel(defaultModel);
    if (!isValidModel) {
      showStatus('Invalid model identifier. Please check available models.', 'error');
      return;
    }

    // Save to chrome.storage
    chrome.storage.sync.set({
      apiKey,
      defaultModel
    }, () => {
      showStatus('Settings saved successfully!', 'success');
      
      // Test the API key
      testApiKey(apiKey);
    });
  });

  async function fetchAvailableModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      availableModels = data.data.map(model => model.id);
    } catch (error) {
      console.error('Error fetching models:', error);
      showStatus('Could not fetch available models. Please check manually.', 'warning');
    }
  }

  async function validateModel(modelId) {
    try {
      // If we have the models list, check against it
      if (availableModels.length > 0) {
        return availableModels.includes(modelId);
      }

      // If we couldn't fetch the models list, make a direct validation request
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error('Failed to validate model');
      }

      const data = await response.json();
      return data.data.some(model => model.id === modelId);
    } catch (error) {
      console.error('Error validating model:', error);
      // If we can't validate, warn the user but allow the save
      showStatus('Could not validate model. Please verify it manually.', 'warning');
      return true;
    }
  }

  function showModelSuggestions(input) {
    if (!availableModels.length) return;

    const matches = availableModels.filter(model => 
      model.toLowerCase().includes(input)
    );

    if (matches.length === 0) {
      hideModelSuggestions();
      return;
    }

    modelSuggestions.innerHTML = matches
      .slice(0, 5) // Limit to 5 suggestions
      .map(model => `
        <div class="suggestion-item" data-model="${model}">
          ${model}
        </div>
      `)
      .join('');

    modelSuggestions.classList.add('visible');

    // Add click handlers to suggestions
    modelSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        defaultModelInput.value = item.dataset.model;
        hideModelSuggestions();
      });
    });
  }

  function hideModelSuggestions() {
    modelSuggestions.classList.remove('visible');
  }

  async function testApiKey(apiKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      const data = await response.json();
      
      // Show credit information if available
      if (data.data?.usage !== undefined) {
        showStatus(`API key verified! Credits used: ${data.data.usage}`, 'success');
      }
    } catch (error) {
      showStatus(`Error validating API key: ${error.message}`, 'error');
    }
  }

  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.className = 'status hidden';
      }, 3000);
    }
  }
});