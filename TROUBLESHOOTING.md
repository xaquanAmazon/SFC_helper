# 🔧 Troubleshooting Guide for SFC Helper

## SFCs Not Auto-Loading from WRM Tickets

### Problem
When you open the extension on a WRM ticket page like `https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/WR-00104829`, the SFCs don't automatically appear in the "SFC List" field.

### Solutions

#### 1. Check Browser Console for Errors
1. While on the WRM ticket page, press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for messages starting with `[SFC Helper]`
4. Common messages:
   - ✅ `[SFC Helper] Found X SFCs: [...]` - Working correctly
   - ⚠️ `[SFC Helper] No SFCs found in ticket` - Pattern not matching
   - ❌ Error messages - Permission or script issues

#### 2. Verify Extension Permissions
1. Go to `chrome://extensions/`
2. Find "SFC Helper"
3. Click "Details"
4. Scroll to "Site access"
5. Ensure it has access to:
   - `https://manufacture.prod.mes.kbobjects.com`
   - `https://ui.prod.console.mse.kuiper.amazon.dev`
   - `https://jira.kbobjects.com`

#### 3. Check SFC Format on Page
The extension looks for SFCs matching this pattern:
- **Format**: `7+ digits - 10 to 20 alphanumeric characters`
- **Example**: `1250649-GPE3GV5460940141`
- **Regex**: `/\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi`

If your SFCs have a different format, you may need to update the regex pattern in [popup.js](popup.js).

#### 4. Manually Test SFC Extraction

On the WRM ticket page, open the console (F12) and run:

```javascript
// Test the SFC pattern
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
const pageText = document.body.textContent;
const matches = pageText.match(sfcPattern);
console.log('Found SFCs:', matches);
```

If this returns `null` or an empty array, the SFCs on the page don't match the expected pattern.

#### 5. Refresh and Reload
1. Reload the WRM ticket page (Ctrl+R or F5)
2. Wait for the page to fully load (tables and data should be visible)
3. **Then** click the extension icon
4. The extension runs when you open it, not when you load the page

#### 6. Check if SFCs are in a Table
The extension searches in multiple locations:
- ✅ Table cells (`<td>`, `<th>`)
- ✅ Text inputs and textareas
- ✅ Elements with "sfc" in class names
- ✅ Data attributes
- ✅ Entire page body (fallback)

To verify where SFCs appear:
1. Right-click on an SFC number on the page
2. Select "Inspect" or "Inspect Element"
3. Note the HTML structure
4. Check if it's in a `<table>`, `<div>`, `<span>`, etc.

## SFCs Not Auto-Loading from JIRA Tickets

### Problem
SFCs don't auto-load from JIRA tickets at `https://jira.kbobjects.com/browse/TEST-xxxxx`

### Solutions

#### 1. Check Custom Field ID
The extension looks for SFCs in a specific JIRA custom field: `#customfield_14006-val`

To verify this is correct:
1. Open a JIRA ticket with SFCs
2. Press F12 to open Developer Tools
3. In the Console, run:
```javascript
document.querySelector('#customfield_14006-val')
```
4. If it returns `null`, the custom field ID is wrong

To find the correct custom field:
1. Right-click on the SFC list in JIRA
2. Select "Inspect"
3. Look for the `id` attribute of the parent element
4. Update `JIRA_SFC_CUSTOMFIELD` in [global.js](global.js)

#### 2. JIRA Field Not Populated
- Ensure the SFC field is actually filled in the JIRA ticket
- Some tickets might not have SFCs listed

#### 3. Use Fallback Search
If the custom field method fails, the extension will search the entire page for SFC patterns. Check the console for messages about fallback search.

## Part Names Not Appearing in Tab Groups

### Problem
Tab groups are created but don't show the part number and name like `WR-00104829 | 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`

### Solutions

#### 1. Understanding the Retry Logic (v2.3+)
The extension uses **intelligent retry logic** with three attempts to extract part info:
- **Attempt 1:** 3 seconds after tab creation
- **Attempt 2:** 5 seconds after tab creation (if first attempt fails)
- **Attempt 3:** 8 seconds after tab creation (if second attempt fails)

**What to expect:**
- On fast networks: Group name updates within 3-5 seconds
- On slow networks: Group name updates within 5-8 seconds
- If all attempts fail: Falls back to simple name like `WR-00104829 | SFC Group - 5 SFCs`

**To monitor retry attempts:**
1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for messages like:
   - `Attempting to get part info from tabs...` (attempt started)
   - `✅ Group name updated on attempt 1` (succeeded on first try)
   - `✅ Group name updated on attempt 2` (succeeded on second try)
   - `✅ Group name updated on attempt 3` (succeeded on third try)

#### 2. Check Part Info Format on MES Pages
The extension looks for part info matching:
- **Pattern**: `PARTNUMBER (PART NAME)`
- **Example**: `122750-201 ( ASSEMBLY, COMINS, PROD)`
- **Location**: Page headers (`h1`, `h2`, header elements, `.page-title`)

To test if part info is detected:
1. Open an MES page manually: `https://manufacture.prod.mes.kbobjects.com/XMII/CM/KUIPER/App/POD/webapp/index.html?SITE=S133&SFC=1250649-GPE3GV5460940141`
2. Press F12 to open Developer Tools
3. In the Console, run:
```javascript
const headers = document.querySelectorAll('h1, h2');
headers.forEach(h => console.log('Header:', h.textContent));
```
4. Look for the part number pattern in the output

#### 3. Update the Part Info Regex
If part info appears in a different format, update the regex in [content.js](content.js):

```javascript
// Current pattern
const match = text.match(/^([\d\-]+)\s*\(\s*([^)]+)\s*\)/);

// Adjust as needed for your format
```

## Extension Not Working at All

### Problem
Extension icon doesn't work, popups don't appear, or nothing happens when clicked

### Solutions

#### 1. Reload the Extension
1. Go to `chrome://extensions/`
2. Find "SFC Helper"
3. Click the **reload/refresh** icon (circular arrow)
4. Try again

#### 2. Check for JavaScript Errors
1. Right-click the extension icon
2. Select "Inspect popup" (this opens DevTools for the popup)
3. Check the Console for errors
4. Screenshot any errors and review them

#### 3. Reinstall the Extension
1. Go to `chrome://extensions/`
2. Remove "SFC Helper"
3. Follow the [installation guide](INSTALLATION.md) again

#### 4. Check Browser Compatibility
- Extension is designed for **Chrome** and **Edge**
- Firefox support is limited (some features may not work)
- Ensure you're using a recent browser version

## Common Error Messages

### "Could not auto-load SFCs. Please enter manually"
- The extension couldn't find SFCs on the current page
- The page might not be a JIRA or WRM ticket
- SFCs might be in an unexpected format or location
- **Solution**: Enter SFCs manually in the text area

### "Please enter both input string and URL template"
- You clicked "Open MES Tabs" without entering any SFCs
- **Solution**: Add SFCs to the "SFC List" field first

### "Cannot access contents of url..."
- The extension doesn't have permission to access that website
- **Solution**: Add the domain to `host_permissions` in [manifest.json](manifest.json)

### Tab groups not supported
- You're using Firefox or an older browser
- **Solution**: Use Chrome or Edge for full tab group support

## Debug Mode

To enable detailed logging:

1. Open [popup.js](popup.js)
2. Add this at the top of the file:
```javascript
const DEBUG_MODE = true;
```
3. Save and reload the extension
4. Check the console for detailed debug output

## Still Having Issues?

1. **Check the README**: [README.md](README.md) for usage instructions
2. **Review the code**:
   - [popup.js](popup.js) - Main logic and SFC extraction
   - [global.js](global.js) - Configuration and selectors
   - [content.js](content.js) - Part info extraction
3. **Update selectors**: If WRM or JIRA UI changes, update the selectors in [global.js](global.js)
4. **Test patterns**: Use browser console to test regex patterns on actual pages

## Tips for Customization

### Change SFC Pattern
Edit the regex in [popup.js](popup.js):
```javascript
// Current: 7+ digits, hyphen, 10-20 alphanumeric
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;

// Example: 6+ digits, hyphen, 8-25 alphanumeric
const sfcPattern = /\b\d{6,}\-[A-Za-z0-9]{8,25}\b/gi;
```

### Change JIRA Custom Field
Edit in [global.js](global.js):
```javascript
const JIRA_SFC_CUSTOMFIELD = "#customfield_14006-val";
// Change to your custom field ID
```

### Add More WRM Selectors
Edit in [global.js](global.js):
```javascript
const WRM_SFC_SELECTORS = [
  "table tbody tr",
  "your-custom-selector-here",
  // Add more selectors
];
```

### Increase Page Load Wait Time
Edit in [popup.js](popup.js):
```javascript
// Current: 5 seconds
setTimeout(async () => {
  // Extract part info
}, 5000);

// Change to 8 seconds for slower pages
setTimeout(async () => {
  // Extract part info
}, 8000);
```

---

**Note**: This extension relies on the structure of external websites (MES, WRM, JIRA). If those sites update their HTML/CSS, the extension may need updates to match the new structure.

Last Updated: v2.1
