#!/bin/bash

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using:"
    echo "  brew install imagemagick  # on macOS"
    echo "  sudo apt install imagemagick  # on Ubuntu/Debian"
    exit 1
fi

# Generate different icon sizes
convert -background none icons/icon.svg -resize 16x16 icons/icon16.png
convert -background none icons/icon.svg -resize 48x48 icons/icon48.png
convert -background none icons/icon.svg -resize 128x128 icons/icon128.png

echo "Icons generated successfully!"