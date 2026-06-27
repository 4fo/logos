#!/bin/bash
# Downloads woff2 files for all 9 font families into public/fonts/

DIR="public/fonts"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

# Build Google Fonts CSS2 URL for all families
URL="https://fonts.googleapis.com/css2?family=Rosarivo:ital,wght@0,400;1,400&family=EB+Garamond:ital,wght@0,400;0,700;1,400&family=Baskervville:ital,wght@0,400;1,400&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400&family=Literata:ital,wght@0,400;0,700;1,400&family=Charis+SIL:ital,wght@0,400;0,700;1,400&family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap"

echo "Fetching font CSS..."
CSS=$(curl -s -H "User-Agent: $UA" "$URL")

# Split CSS into individual @font-face blocks and process each
IFS='@'
blocks=($(echo "$CSS" | sed 's/@/\n@/g' | grep 'font-face'))

for block in "${blocks[@]}"; do
  # Extract values using grep/sed
  family=$(echo "$block" | grep -o "font-family: '[^']*'" | sed "s/font-family: '//;s/'//")
  style=$(echo "$block" | grep -o "font-style: [a-z]*" | awk '{print $2}')
  weight=$(echo "$block" | grep -o "font-weight: [0-9]*" | awk '{print $2}')
  url=$(echo "$block" | grep -o 'url([^)]*' | sed 's/url(//' | head -1)

  if [ -n "$family" ] && [ -n "$weight" ] && [ -n "$url" ]; then
    # Normalize family name
    normalized=$(echo "$family" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

    # Build filename: family-weight.woff2 (italic files get -italic added)
    sfx=""
    if [ "$style" = "italic" ]; then
      sfx="i"
    fi
    fname="${normalized}-${weight}${sfx}.woff2"

    echo "Downloading $fname ($family $weight $style)..."
    curl -sL -o "$DIR/$fname" "$url"
    
    # Verify file size
    size=$(stat -f%z "$DIR/$fname" 2>/dev/null || stat -c%s "$DIR/$fname" 2>/dev/null)
    if [ "$size" -gt 1000 ]; then
      echo "  OK ($size bytes)"
    else
      echo "  WARNING: small file ($size bytes)"
    fi
  fi
done

echo "Done. Files in $DIR:"
ls -lh "$DIR/"
