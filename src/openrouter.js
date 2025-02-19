export class OpenRouterAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.API_URL = 'https://openrouter.ai/api/v1';
  }

  async getModels() {
    const response = await fetch(`${this.API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'AI Swiss Army Knife Extension'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    return (await response.json()).data;
  }

  async chat(messages, options = {}) {
    const {
      model = 'openai/gpt-4',
      stream = false,
      onStream = null,
      temperature = 0.7,
      max_tokens,
      tools,
      tool_choice,
      response_format,
      transforms = ['middle-out']
    } = options;

    const body = {
      model,
      messages,
      stream,
      temperature,
      transforms
    };

    if (max_tokens) body.max_tokens = max_tokens;
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;
    if (response_format) body.response_format = response_format;

    if (stream && !onStream) {
      throw new Error('onStream callback required for streaming responses');
    }

    const response = await fetch(`${this.API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'AI Swiss Army Knife Extension'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `OpenRouter API error: ${response.statusText}`);
    }

    if (stream) {
      return this.handleStream(response, onStream);
    } else {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  }

  async handleStream(response, onStream) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              if (content) {
                onStream(content);
              }
            } catch (e) {
              // Ignore invalid JSON (comments)
            }
          }
        }
      }
    } finally {
      reader.cancel();
    }
    return null;
  }

  async validateModel(modelId) {
    try {
      const models = await this.getModels();
      return models.some(model => model.id === modelId);
    } catch (error) {
      console.error('Error validating model:', error);
      return false;
    }
  }

  async getBestModelForTask(task, requirements = {}) {
    const models = await this.getModels();
    
    // Filter models based on requirements
    let candidates = models.filter(model => {
      if (requirements.minContextLength && model.context_length < requirements.minContextLength) {
        return false;
      }
      if (requirements.maxPrice && (
        model.pricing.prompt > requirements.maxPrice.prompt ||
        model.pricing.completion > requirements.maxPrice.completion
      )) {
        return false;
      }
      if (requirements.features) {
        for (const feature of requirements.features) {
          if (!model.supported_parameters?.includes(feature)) {
            return false;
          }
        }
      }
      return true;
    });

    // Sort by relevant criteria based on task
    switch (task) {
      case 'summarize':
      case 'analyze':
      case 'create':
        candidates.sort((a, b) => b.context_length - a.context_length);
        break;
      case 'chat':
        candidates.sort((a, b) => 
          (parseFloat(b.pricing.completion) - parseFloat(a.pricing.completion))
        );
        break;
      case 'code':
        candidates = candidates.filter(m => 
          m.supported_parameters?.includes('tools') ||
          m.id.toLowerCase().includes('code')
        );
        break;
      default:
        candidates.sort((a, b) => b.context_length - a.context_length);
    }

    return candidates[0]?.id || 'openai/gpt-4';
  }
}