# AI Swiss Army Knife Browser Extension

A versatile AI-powered browser extension that helps you summarize content, generate replies, create blog posts, and more using OpenRouter's API.

## Features

- **Content Summarization**: Quickly summarize any selected text or webpage
- **Reply Generation**: Generate contextual replies for emails, messages, or social media
- **Blog Post Creation**: Transform ideas or content into well-structured blog posts
- **Multiple AI Models**: Support for various AI models through OpenRouter
- **Context Menu Integration**: Easy access through right-click menu
- **Customizable Settings**: Choose your preferred AI model and configure API settings

## Installation

1. Clone this repository:
   ```bash
   git clone git@github.com:geeknik/ai-swiss-army-knife.git
   cd ai-swiss-army-knife
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Brave:
   - Open `brave://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Configuration

1. Get an API key from [OpenRouter](https://openrouter.ai/)
2. Click the extension icon in your browser
3. Enter your OpenRouter API key
4. Select your preferred default AI model
5. Click "Save Settings"

## Usage

1. Select text on any webpage
2. Right-click to open the context menu
3. Navigate to "AI Swiss Army Knife" and choose your desired action:
   - Summarize
   - Generate Reply
   - Create Blog Post

The result will appear in a floating window on the webpage, where you can:
- Read the generated content
- Copy the content to clipboard
- Close the window

## Development

The extension is built using standard web technologies:
- HTML/CSS for the popup interface
- JavaScript for functionality
- Chrome Extension Manifest V3

Key files:
- `manifest.json`: Extension configuration
- `popup.html/js`: Settings interface
- `background.js`: Background service worker
- `content.js`: Content script for webpage integration

## License

MIT License
