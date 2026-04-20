# SFC Helper v2.3.1

A Chrome extension that helps manage SFC (Shop Floor Control) links and automatically creates organized tab groups with intelligent naming based on part information and work orders.

## Fixed issue in v2.3
- Error extract SFCs with format `1270378-35936`.
- Updated sfcPattern regex - changed minimum character count from 10 to 5 in the alphanumeric portion
- Old: /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi
- New: /\b\d{7,}\-[A-Za-z0-9]{5,20}\b/gi
```javascript
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{5,20}\b/gi;
```

## New Features in v2.3

### Work Order in Group Names
- Group names now include the work order/ticket number
- Format: `WR-00104829 | 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- Automatically uses the ticket number from the ticket field
- Makes it easy to identify which work order the SFCs belong to

### Improved Reliability with Retry Logic
- Part info extraction now retries up to 3 times with increasing delays (3s, 5s, 8s)
- Automatically falls back if MES pages load slowly
- Better console logging to track extraction progress
- Significant improvement in group naming success rate

### Previous Updates (v2.2)

#### Auto-Extract Ticket Numbers
- Automatically extracts ticket numbers from WRM and JIRA URLs
- Populates the "Ticket Number" field when you open the extension on a ticket page
- Works with both URL patterns and page content

#### Fixed Group Tab Naming
- Group tabs now properly update with LRU part numbers and names
- Format includes part number and description
- Handles multiple part numbers intelligently

#### Clean UI
- Removed emoji symbols that were displaying as weird characters
- Cleaner, more professional appearance

## Features

### Auto-Generated Group Names
- Automatically extracts part numbers and names from MES webpage headers
- Creates descriptive tab group names like: `122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- Shows SFC count in the group name
- Handles multiple part numbers intelligently

### Modern UI
- Beautiful gradient design with improved user experience
- Clear visual hierarchy and better spacing
- Responsive buttons with hover effects
- Informative badges and tooltips

### Smart Features
- Auto-loads SFCs from JIRA and WRM tickets
- Auto-extracts ticket numbers from URLs
- One-click copy SFC links to clipboard
- Supports both JIRA (TEST-xxxxx) and WRM (WR-xxxxxxxx) ticket formats
- Read-only URL template field to prevent accidental changes
- Settings page with "Reset to Defaults" option

## How to Use

### Opening SFC Tabs
1. Enter or auto-load SFCs (one per line)
2. Optionally enter or auto-extract a ticket/work order number
3. Click "Open MES Tabs"
4. Extension will:
   - Create tabs for each SFC
   - Extract part info from loaded pages (tries 3 times: 3s, 5s, 8s delays)
   - Name the tab group with work order + part info + SFC count

### Group Name Format
With work order:
- **Single Part**: `WR-00104829 | 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- **Multiple Parts (≤3)**: `WR-00104829 | 122750-201, 122751-101 - 7 SFCs`
- **Many Parts (>3)**: `WR-00104829 | 4 Parts - 12 SFCs`

Without work order:
- **Single Part**: `122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- **Multiple Parts (≤3)**: `122750-201, 122751-101 - 7 SFCs`
- **Many Parts (>3)**: `4 Parts - 12 SFCs`
- **Fallback**: `Custom Name - 5 SFCs` (if part info can't be extracted)

### Opening Tickets
- Enter ticket number manually: `WR400`, `WR-400`, or `21506`
- Or let extension auto-extract it from the current ticket page
- Click "Open" to open the ticket in a new tab
- Extension auto-detects JIRA vs WRM format

### Copy Links
- Click "Copy SFC Links" to copy formatted links
- Paste into Word/Outlook for clickable links
- Also copies plain text for other uses

## Settings

Access via the settings link at the bottom of the popup.

### Configurable URLs
- **MES URL Template**: `https://manufacture.prod.mes.kbobjects.com/XMII/CM/KUIPER/App/POD/webapp/index.html?SITE={SITE}&SFC={SFC}`
- **JIRA URL Template**: `https://jira.kbobjects.com/browse/TEST-{TICKET}`
- **WRM URL Template**: `https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/{TICKET}`
- **Default Site**: `S133`

Use placeholders:
- `{SITE}` - Site ID
- `{SFC}` - SFC number
- `{TICKET}` - Ticket number

### Reset to Defaults
Click "Reset to Defaults" to restore all settings to their original values.

## Technical Details

### Part Info Extraction
The extension looks for part information in MES page headers matching patterns like:
- `122750-201 ( ASSEMBLY, COMINS, PROD)`
- Various HTML elements: `h1`, `h2`, `h3`, `.page-title`, header elements, spans, divs

### Content Script
- Runs on `https://manufacture.prod.mes.kbobjects.com/*`
- Executes after page load (`document_idle`)
- Extracts part numbers and names from page headers

## Permissions
- `tabs` - Create and manage tabs
- `tabGroups` - Organize tabs into named groups
- `activeTab` - Access current tab info
- `scripting` - Inject content scripts
- `storage` - Save user preferences
- `clipboardWrite` - Copy links to clipboard

## Version History

### v2.3 (Current)
- ✅ Implemented retry logic for part info extraction (3 attempts: 3s, 5s, 8s)
- ✅ Added work order to group names for better organization
- ✅ Fixed intermittent group naming issues with multi-attempt strategy
- ✅ Group names now include ticket number: "WR-00104829 | 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs"
- ✅ More reliable part info extraction even on slow-loading pages

### v2.2
- ✅ Fixed group tab naming - now properly displays LRU part numbers and names
- ✅ Auto-extracts ticket numbers from WRM/JIRA URLs and page content
- ✅ Removed emoji symbols for cleaner UI display
- ✅ Increased part info extraction wait time to 5 seconds for better reliability
- ✅ Improved part info extraction with more selectors and better pattern matching
- ✅ Better debugging with console logging

### v2.1
- Major Fix: Improved WRM SFC extraction with robust pattern matching
- 🔍 Uses flexible regex pattern to find SFCs: `\b\d{7,}\-[A-Za-z0-9]{10,20}\b`
- 🎯 Multiple extraction strategies (tables, text fields, page scan, data attributes)
- 🐛 Fixed brittle CSS selectors that broke with AWS UI updates
- 📋 Added debug logging for troubleshooting (check browser console)
- ✅ Better error handling and user feedback
- 🔐 Added explicit host permissions for JIRA, WRM, and MES domains
- 📖 Added comprehensive troubleshooting guide

### v2.0
- ✨ Auto-generated group names from part info
- 🎨 Complete UI redesign with modern styling
- 📊 SFC count display in group names
- 🔧 Improved settings page with reset option
- 🐛 Fixed WRM ticket URL loading bug

### v1.3
- Added WRM ticket support
- Fixed settings storage issues
- Added reset to defaults functionality

### v1.2
- Initial release
- Basic SFC tab opening
- JIRA integration
- URL template support

## Usage Tips

1. **For Best Results**: Wait for the full 5 seconds after clicking "Open MES Tabs" to allow pages to load and part info to be extracted
2. **Custom Names**: You can still manually enter a group name before opening tabs - it will be combined with the SFC count
3. **Ticket Auto-Load**: Open a JIRA/WRM ticket first, then open the extension to auto-populate SFCs and ticket number
4. **Multiple Sites**: Change the Site ID field if working with different sites
5. **Debugging**: Check browser console (F12) for `[SFC Helper]` messages if SFCs aren't loading

## Troubleshooting

Having issues? Check the comprehensive [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md) guide for:
- SFCs not auto-loading from WRM/JIRA tickets
- Part names not appearing in tab groups  
- Extension not working
- Common error messages
- Debug mode and testing tips
- Customization instructions

## Files Structure

```
SFC_Helper(2_fixed)/
├── manifest.json          # Extension configuration
├── global.js              # Global constants and defaults
├── popup.html             # Main popup interface
├── popup.js               # Popup logic and tab management
├── settings.html          # Settings page interface
├── settings.js            # Settings page logic
├── content.js             # Content script for part info extraction
├── README.md              # Full documentation
├── INSTALLATION.md        # Installation guide
├── TROUBLESHOOTING.md     # Troubleshooting guide
└── images/                # Extension icons
    └── icon-128.png
```

## Common Issues

**Group names not showing part info?**
- Make sure MES pages have fully loaded (extension waits 5 seconds)
- Check if the page header contains the expected part number format
- Try manually setting a group name as fallback
- Check browser console (F12) for `[SFC Helper]` debug messages

**SFCs not auto-loading?**
- Ensure you're on a JIRA or WRM ticket page
- Refresh the ticket page and try again
- Verify extension has permission to access the ticket page
- Check browser console for error messages

**Ticket number not auto-filling?**
- Extension extracts from URL first, then page content
- Manually enter if auto-extraction fails
- Check console for extraction messages

**Settings not saving?**
- Check browser console for errors
- Try clicking "Reset to Defaults" and reconfigure
- Ensure you have the latest version installed

---

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Made with care for manufacturing efficiency
