# 🚀 Quick Installation Guide

## Install the Extension

### For Chrome/Edge (Developer Mode)

1. **Open Extension Management**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder: `SFC_Helper(2_fixed)`
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "SFC Helper v2.0" in your extensions list
   - The extension icon should appear in your browser toolbar
   - If you don't see it, click the puzzle piece icon and pin "SFC Helper"

## First Time Setup

1. **Click the Extension Icon** in your toolbar

2. **Go to Settings** (link at bottom of popup)

3. **Verify Default Settings**:
   - Site: `S133`
   - MES URL: `https://manufacture.prod.mes.kbobjects.com/XMII/CM/KUIPER/App/POD/webapp/index.html?SITE={SITE}&SFC={SFC}`
   - JIRA URL: `https://jira.kbobjects.com/browse/TEST-{TICKET}`
   - WRM URL: `https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/{TICKET}`

4. **Customize if Needed** and click "Save Settings"

## Test the Extension

### Test 1: Manual SFC Entry
1. Click the extension icon
2. Enter some test SFCs in the "SFC List" field (one per line):
   ```
   1250649-GPE3GV5460940141
   1250650-GPE3GV5460940142
   ```
3. Click "Open MES Tabs"
4. Wait 3-8 seconds for pages to load and group name to update (v2.3 uses retry logic)
5. Check if a tab group was created with the part info and work order in the name

### Test 2: Ticket Integration
1. Navigate to a JIRA or WRM ticket in your browser
2. Click the extension icon
3. SFCs should auto-populate in the "SFC List" field
4. Click "Open MES Tabs"

### Test 3: Copy Links
1. Enter some SFCs
2. Click "Copy SFC Links"
3. Paste into a Word document or email
4. Links should be clickable

## Updating the Extension

When you make changes to the code:

1. Go to `chrome://extensions/` or `edge://extensions/`
2. Click the refresh/reload icon on the "SFC Helper" card
3. The extension will reload with your changes

## Troubleshooting

### Extension Not Loading
- Make sure you selected the correct folder containing `manifest.json`
- Check that all files are present in the folder
- Look for error messages in the extensions page

### Content Script Not Working
- Make sure you're on the correct MES domain: `https://manufacture.prod.mes.kbobjects.com/*`
- Check the browser console (F12) for JavaScript errors
- Try reloading the MES page after installing the extension

### Group Names Not Updating
- Wait up to 8 seconds after clicking "Open MES Tabs" (v2.3 retries at 3s, 5s, and 8s)
- Check if the MES pages have the part number in the expected format
- Open Developer Tools (F12) on the MES page and look for the part number in the page header
- Check the console for `[SFC Helper]` debug messages and retry attempt logs

### Settings Not Saving
- Make sure you clicked "Save Settings" button
- Check browser console for errors
- Try using "Reset to Defaults" first, then reconfigure

## Need Help?

Check the [README.md](README.md) for detailed documentation and usage tips.

---

Enjoy your enhanced SFC workflow! 🎉
