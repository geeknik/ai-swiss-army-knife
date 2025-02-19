import { OpenRouterAPI } from './openrouter.js';

// Initialize API (will be set when key is available)
let api = null;

// Context menu structure
const MENU_STRUCTURE = {
  write: {
    title: 'Write',
    children: {
      email: { title: 'Email' },
      blogPost: { title: 'Blog Post' },
      article: { title: 'Article' },
      tweet: { title: 'Tweet/Social Post' },
      technical: { title: 'Technical Document' },
      academic: { title: 'Academic Paper' }
    }
  },
  analyze: {
    title: 'Analyze',
    children: {
      summarize: { title: 'Summarize' },
      critique: { title: 'Review/Critique' },
      sentiment: { title: 'Analyze Sentiment' },
      extract: { title: 'Extract Key Points' },
      data: { title: 'Analyze Data' }
    }
  },
  code: {
    title: 'Code',
    children: {
      explain: { title: 'Explain Code' },
      generate: { title: 'Generate Code' },
      improve: { title: 'Improve Code' },
      document: { title: 'Document Code' },
      test: { title: 'Generate Tests' }
    }
  },
  translate: {
    title: 'Translate',
    children: {
      toEnglish: { title: 'To English' },
      fromEnglish: { title: 'From English' },
      improve: { title: 'Improve Translation' }
    }
  },
  assist: {
    title: 'Assist',
    children: {
      reply: { title: 'Generate Reply' },
      research: { title: 'Research Topic' },
      meetings: { title: 'Meeting Notes' },
      proofread: { title: 'Proofread' },
      cite: { title: 'Add Citations' }
    }
  },
  social: {
    title: 'Social Media',
    children: {
      reply: { title: 'Reply to Tweet/Post' },
      thread: { title: 'Create Thread' },
      engagement: { title: 'Boost Engagement' },
      hashtags: { title: 'Generate Hashtags' }
    }
  }
};

// Task configurations
const TASK_CONFIGS = {
  write: {
    email: {
      system: 'You are an expert email composer who writes clear, professional emails.',
      user: 'Write an email based on this context:\n\n{content}',
      temperature: 0.7,
      stream: true
    },
    blogPost: {
      system: 'You are a skilled blog writer who creates engaging, well-structured posts.',
      user: 'Create a blog post based on this topic:\n\n{content}',
      temperature: 0.6,
      stream: true
    },
    article: {
      system: 'You are an experienced article writer who creates comprehensive, engaging content.',
      user: 'Write an article about:\n\n{content}',
      temperature: 0.6,
      stream: true
    },
    tweet: {
      system: 'You are a social media expert who creates engaging, viral content while respecting context and platform limitations.',
      user: 'Create a tweet or short social media post about:\n\n{content}',
      temperature: 0.8,
      max_tokens: 100
    }
  },
  analyze: {
    summarize: {
      system: 'You are an expert content summarizer who extracts key information while maintaining context and nuance.',
      user: 'Please provide a comprehensive summary of:\n\n{content}',
      temperature: 0.3,
      stream: true
    },
    sentiment: {
      system: 'You are an expert in sentiment analysis and emotional intelligence.',
      user: 'Analyze the sentiment and emotional tone of:\n\n{content}',
      temperature: 0.2,
      response_format: { 
        type: 'json_object',
        schema: {
          type: 'object',
          properties: {
            sentiment: { type: 'string' },
            emotions: { type: 'array', items: { type: 'string' } },
            analysis: { type: 'string' }
          }
        }
      }
    }
  },
  social: {
    reply: {
      system: 'You are a social media expert who crafts engaging, appropriate replies that maintain a friendly yet professional tone.',
      user: 'Generate a reply to this post/tweet:\n\n{content}',
      temperature: 0.7,
      max_tokens: 280 // Twitter limit
    },
    thread: {
      system: 'You are a social media expert who creates engaging, viral Twitter threads that educate and entertain.',
      user: 'Create a Twitter thread about:\n\n{content}',
      temperature: 0.7,
      stream: true
    }
  },
  assist: {
    reply: {
      system: 'You are a helpful assistant who generates contextually appropriate replies.',
      user: 'Generate a reply to:\n\n{content}',
      temperature: 0.7,
      stream: true
    },
    research: {
      system: 'You are a thorough researcher who provides comprehensive insights and analysis.',
      user: 'Research and provide insights about:\n\n{content}',
      temperature: 0.3,
      stream: true
    }
  }
};

// Initialize context menus and API
chrome.runtime.onInstalled.addListener(async () => {
  // Initialize API if key exists
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  if (apiKey) {
    api = new OpenRouterAPI(apiKey);
  }

  // Create context menus
  createContextMenus(MENU_STRUCTURE);
});

// Listen for changes to API key
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.apiKey) {
    const newApiKey = changes.apiKey.newValue;
    if (newApiKey) {
      api = new OpenRouterAPI(newApiKey);
    } else {
      api = null;
    }
  }
});

// Create context menus recursively
function createContextMenus(structure, parentId = null) {
  Object.entries(structure).forEach(([id, item]) => {
    const menuId = parentId ? `${parentId}_${id}` : id;
    chrome.contextMenus.create({
      id: menuId,
      title: item.title,
      contexts: ['selection', 'page'],
      parentId: parentId
    });

    if (item.children) {
      createContextMenus(item.children, menuId);
    }
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) {
    console.error('No valid tab ID found');
    return;
  }

  try {
    // Check if API is initialized
    if (!api) {
      const { apiKey } = await chrome.storage.sync.get('apiKey');
      if (!apiKey) {
        throw new Error('OpenRouter API key not set. Please set it in the extension options.');
      }
      api = new OpenRouterAPI(apiKey);
    }

    // Get the selected text or page URL
    const content = info.selectionText || info.pageUrl;
    if (!content) {
      throw new Error('No content selected');
    }

    // Parse menu ID to get task type and action
    const [category, action] = info.menuItemId.split('_');
    
    // Show loading state
    await showLoading(tab.id, action);

    // Process the task
    await processTask(category, action, content, tab.id);

  } catch (error) {
    console.error('Error handling context menu click:', error);
    await showError(tab.id, error.message);
  }
});

function getRequiredFeatures(action) {
  const features = new Set();
  
  switch (action) {
    case 'code':
    case 'test':
      features.add('tools');
      break;
    case 'data':
      features.add('structured_outputs');
      break;
    case 'academic':
      features.add('tools');
      features.add('structured_outputs');
      break;
  }
  
  return Array.from(features);
}

function getTaskConfig(category, action, content) {
  const config = TASK_CONFIGS[category]?.[action];
  if (!config) {
    // Fallback config for actions without specific configurations
    return {
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful assistant skilled in ${action} tasks.`
        },
        { 
          role: 'user',
          content: `${content}`
        }
      ],
      options: {
        temperature: 0.7,
        stream: true
      }
    };
  }

  return {
    messages: [
      { role: 'system', content: config.system },
      { role: 'user', content: config.user.replace('{content}', content) }
    ],
    options: {
      temperature: config.temperature,
      stream: config.stream,
      max_tokens: config.max_tokens,
      response_format: config.response_format
    }
  };
}

async function processTask(category, action, content, tabId) {
  try {
    // Get the best model for this task
    const model = await api.getBestModelForTask(action, {
      features: getRequiredFeatures(action)
    });

    // Get task configuration
    const { messages, options } = getTaskConfig(category, action, content);
    
    // Process the request
    if (options.stream) {
      let streamedContent = '';
      await api.chat(messages, {
        ...options,
        model,
        onStream: (chunk) => {
          streamedContent += chunk;
          showStreamingResult(tabId, streamedContent, action);
        }
      });
    } else {
      const result = await api.chat(messages, { ...options, model });
      await showResult(tabId, result, action, model);
    }
  } catch (error) {
    throw new Error(`Failed to process task: ${error.message}`);
  }
}

// UI communication functions
async function showLoading(tabId, action) {
  await sendMessageToTab(tabId, {
    action: 'showLoading',
    taskType: action
  });
}

async function showResult(tabId, result, action, model) {
  await sendMessageToTab(tabId, {
    action: 'showResult',
    result,
    type: action,
    model
  });
}

async function showStreamingResult(tabId, content, action) {
  await sendMessageToTab(tabId, {
    action: 'updateStreamingResult',
    content,
    type: action
  });
}

async function showError(tabId, message) {
  await sendMessageToTab(tabId, {
    action: 'showError',
    error: message
  });
}

async function sendMessageToTab(tabId, message) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // If content script isn't loaded, inject it and retry
    await injectContentScript(tabId);
    await new Promise(resolve => setTimeout(resolve, 100));
    await chrome.tabs.sendMessage(tabId, message);
  }
}

async function injectContentScript(tabId) {
  const manifest = chrome.runtime.getManifest();
  const contentScripts = manifest.content_scripts?.[0]?.js || [];

  for (const script of contentScripts) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [script]
    });
  }
}