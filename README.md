# AI Swiss Army Knife Browser Extension

A powerful browser extension that brings OpenRouter's AI capabilities directly into your browser. Use AI to assist with writing, analysis, coding, social media, and more.

## Features

### Writing Assistance
- **Email Composition**: Generate professional emails
- **Blog Posts**: Create engaging blog content
- **Articles**: Write comprehensive articles
- **Technical Documentation**: Create clear technical docs
- **Academic Papers**: Generate scholarly content

### Content Analysis
- **Summarization**: Quick or detailed summaries of any content
- **Sentiment Analysis**: Analyze emotional tone and sentiment
- **Key Point Extraction**: Pull out important information
- **Data Analysis**: Analyze numerical and textual data
- **Review & Critique**: Get balanced, constructive feedback

### Code Tools
- **Code Explanation**: Get clear explanations of code
- **Code Generation**: Create code from descriptions
- **Code Improvement**: Optimize and enhance code
- **Documentation**: Generate code documentation
- **Test Generation**: Create unit tests

### Translation
- **To English**: Translate any text to English
- **From English**: Translate English to other languages
- **Translation Improvement**: Enhance existing translations

### Social Media
- **Tweet/Post Replies**: Generate contextual social media replies
- **Thread Creation**: Create engaging tweet threads
- **Engagement Optimization**: Improve post engagement
- **Hashtag Generation**: Generate relevant hashtags

### Research & Assistance
- **Research**: Deep dive into topics
- **Meeting Notes**: Generate meeting summaries
- **Proofreading**: Check and improve text
- **Citation**: Add proper citations to content

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/geeknik/ai-swiss-army-knife/
   cd ai-swiss-army-knife
   ```

2. Load in Brave:
   - Open `brave://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Configuration

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Click the extension icon
3. Enter your OpenRouter API key
4. Optionally select default models for different tasks

## Usage

1. Select text on any webpage
2. Right-click to access the AI Swiss Army Knife menu
3. Choose your desired action from the categories:
   - Write
   - Analyze
   - Code
   - Translate
   - Assist
   - Social

The result will appear in a floating window where you can:
- View the generated content
- Copy to clipboard
- Save to file
- Regenerate if needed

## Technical Details

### Architecture
- Built with vanilla JavaScript using ES modules
- Uses Chrome Extension Manifest V3
- Integrates with OpenRouter's API for access to multiple AI models
- Real-time streaming support for longer content generation

### Key Files
- `manifest.json`: Extension configuration
- `src/background.js`: Service worker for extension functionality
- `src/openrouter.js`: OpenRouter API integration
- `src/content.js`: Content script for webpage integration
- `src/content.css`: Styling for the UI elements
- `popup.html/js`: Settings interface

### Features
- Dynamic model selection based on task
- Streaming responses for longer content
- Automatic error recovery
- Context-aware prompts
- Task-specific configurations
- Response format validation

## Model Selection

The extension automatically selects the best AI model for each task based on:
- Task requirements (context length, tools needed)
- Model capabilities
- Cost efficiency
- Response time

## Privacy & Security

- API keys are stored securely in Chrome's sync storage
- No data is stored except your OpenRouter API key
- All processing happens through OpenRouter's API
- Content remains private between you and the AI model

## Development

To modify or enhance the extension:

1. Clone the repository
2. Make your changes
3. Test locally by loading the unpacked extension
4. Submit pull requests for improvements

### Adding New Features

To add new capabilities:
1. Add menu items to `MENU_STRUCTURE` in background.js
2. Add task configurations to `TASK_CONFIGS`
3. Update UI handling in content.js if needed

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.                                                                                                                                                  
