# Chrome Extension Debugging Guide

## How to Debug the Extension Popup

### Step 1: Open Chrome DevTools for the Extension

1. Go to `chrome://extensions/`
2. Make sure "Developer mode" is enabled (toggle in top-right)
3. Find "D-Level AI Analyzer" extension
4. Click **"Reload"** button to load the latest build
5. Click **"Inspect views: popup.html"** link
   - This opens DevTools specifically for the popup

### Step 2: Check if CSS is Loading

In the DevTools Console tab, check for errors:

```javascript
// Check if CSS file loaded
document.querySelector('link[href="popup.css"]')

// Check if styles are applied
getComputedStyle(document.body).backgroundColor
```

### Step 3: Inspect the Network Tab

1. Click the **Network** tab in DevTools
2. Reload the extension popup (close and reopen it)
3. Look for `popup.css` in the network requests
4. Check:
   - Status: Should be 200
   - Size: Should be ~25KB
   - Type: Should be "stylesheet"

### Step 4: Check Console for Errors

Look in the **Console** tab for:
- Red error messages
- Failed to load resources
- React errors
- CSS parsing errors

### Step 5: Inspect the DOM

1. Click the **Elements** tab
2. Find the `<head>` section
3. Verify the `<link>` tag exists:
   ```html
   <link href="popup.css" rel="stylesheet">
   ```
4. Click on it to see if CSS loads

### Step 6: Test Specific Elements

In the Console, try these commands:

```javascript
// Check if root element exists
document.getElementById('root')

// Check if React rendered
document.getElementById('root').children.length

// Check computed styles on a specific element
const card = document.querySelector('[data-slot="card"]')
if (card) {
  console.log('Card styles:', getComputedStyle(card))
}

// Check if Tailwind classes are being applied
const flexElement = document.querySelector('.flex')
if (flexElement) {
  console.log('Flex display:', getComputedStyle(flexElement).display)
}
```

### Step 7: Check for CSP Issues

Chrome extensions have Content Security Policy restrictions. Check Console for messages like:
- "Refused to load..."
- "Content Security Policy..."

If you see CSP errors, we may need to update `manifest.json`.

### Step 8: Manual CSS Check

In the Console, manually apply a style to test:

```javascript
document.body.style.backgroundColor = 'red'
```

If this works, JavaScript is running. If CSS classes don't work, there's a Tailwind/CSS loading issue.

### Step 9: Check Build Output

Verify files in `/chrome-extension/dist/`:

```bash
ls -lh dist/
```

Should show:
- `popup.html` (266 bytes)
- `popup.css` (~25KB)
- `popup.js` (~6.5MB)

## Common Issues and Fixes

### Issue 1: CSS File Not Found (404)
**Symptoms:** Network tab shows 404 for popup.css
**Fix:** 
```bash
cd chrome-extension
npm run build
# Then reload extension
```

### Issue 2: CSS Classes Not Applied
**Symptoms:** Elements have class names but no styles
**Possible causes:**
1. Tailwind not processing CSS properly
2. CSS specificity issues
3. CSP blocking inline styles

**Fix:**
```bash
# Rebuild with clean output
rm -rf dist
npm run build
```

### Issue 3: React Not Rendering
**Symptoms:** Empty `<div id="root"></div>`
**Check:** Console for React errors
**Fix:** Check popup.js is loading and no JavaScript errors

### Issue 4: Wrong CSS Version Cached
**Symptoms:** Old styles showing up
**Fix:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear extension cache
3. Reload extension completely

## Debugging Commands to Run

Run these in your terminal to gather info:

```bash
cd /Users/ad_workstation_42/Documents/adchitects/dlevel-ai/chrome-extension

# Check if CSS has Tailwind classes
grep -E '\.flex|\.grid|\.p-6|\.rounded|\.shadow' dist/popup.css | head -20

# Verify file sizes
ls -lh dist/*.{html,css,js}

# Check HTML content
cat dist/popup.html

# Check if popup.js has errors
head -100 dist/popup.js
```

## What to Report Back

If the issue persists, provide:

1. **Console errors** (screenshot or text)
2. **Network tab** (screenshot showing CSS request)
3. **Elements tab** (screenshot showing <link> tag)
4. **File sizes** from `ls -lh dist/`
5. **CSS class test** results from Step 6 above

## Quick Fixes to Try

### Fix 1: Force Rebuild Everything
```bash
cd chrome-extension
rm -rf dist node_modules
npm install
npm run build
```

### Fix 2: Check Extension Permissions
Make sure `manifest.json` doesn't block resources:
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Fix 3: Verify popup.html Template
The template should be minimal and not interfere with CSS loading.

