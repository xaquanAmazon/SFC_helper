# SFC Helper v2.2 - Changelog

## What's Fixed in v2.2

### 1. Group Tab Naming Now Works Properly ✓

**The Problem:**
- Tab groups were created but the name wasn't updating with the LRU part number and name
- The group name remained as the default instead of showing something like: `122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`

**The Fix:**
- Fixed the group creation logic to properly create the group first, then update its name
- Changed from 3 seconds to 5 seconds wait time for more reliable part info extraction
- Improved part info extraction with more HTML selectors (h1, h2, h3, spans, divs, etc.)
- Changed regex pattern to not require start-of-string match: `([\d\-]+)\s*\(\s*([^)]+)\s*\)` instead of `^([\d\-]+)\s*\(\s*([^)]+)\s*\)`
- Added better debugging with console.log messages
- Fixed groupId being undefined by properly returning it from the group creation function

**Code Changes:**
- [popup.js](popup.js): Refactored `namingGroup()` and `addTabToGroup()` into `createAndNameGroup()` and `updateGroupName()`
- [popup.js](popup.js): Improved part info extraction function with more selectors and better logging
- Updated wait time from 3000ms to 5000ms throughout

### 2. Removed Emoji Symbols from UI ✓

**The Problem:**
- UI had weird symbol characters (emojis) displaying incorrectly
- Made the interface look unprofessional

**The Fix:**
- Removed all emoji characters from:
  - [popup.html](popup.html): Removed 🚀, 🌐, 📋, ⚙️
  - [settings.html](settings.html): Removed ⚙️, 💡, 🏭, 🌐, 🎫, 📝, 💾, 🔄
  - [README.md](README.md): Cleaned up all emoji section headers

**UI Now Shows:**
- "SFC Helper" instead of "🚀 SFC Helper"
- "Open MES Tabs" instead of "🌐 Open MES Tabs"
- "Copy SFC Links" instead of "📋 Copy SFC Links"
- "Settings" instead of "⚙️ Settings"

### 3. Auto-Extract WRM Ticket Numbers ✓

**The Problem:**
- When viewing a WRM ticket page like `https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/WR-00104829`, the ticket number wasn't being extracted

**The Fix:**
- Added new `extractTicketNumberFromPage()` function
- Extracts ticket numbers from:
  1. **URL first** - Parses WRM URLs for pattern: `/work-requests/(WR-?\d+)`
  2. **URL for JIRA** - Parses JIRA URLs for pattern: `/browse/[A-Z]+-(\d+)`
  3. **Page content** - Falls back to searching page for ticket patterns
  4. **Headers** - Checks h1, h2, h3 elements
  5. **Page title** - Checks document.title
- Auto-populates the "Ticket Number" field when you open the extension on a ticket page

**Code Changes:**
- [popup.js](popup.js): Added `extractTicketNumberFromPage()` function
- Calls this function automatically when opening extension on JIRA/WRM pages

### 4. Improved SFC Extraction (from v2.1)

**Already Fixed:**
- Uses flexible regex pattern: `/\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi`
- Searches multiple locations: tables, text fields, page body, data attributes
- Removes duplicate SFCs automatically
- Sorts results alphabetically
- Case-insensitive matching and converts to uppercase

## How to Update

1. Go to `chrome://extensions/` in your browser
2. Find "SFC Helper" 
3. Click the **reload/refresh icon** (circular arrow)
4. Version should now show **v2.2**

## Testing the Fixes

### Test Group Tab Naming
1. Navigate to a WRM or JIRA ticket with SFCs
2. Open the extension (SFCs should auto-populate)
3. Click "Open MES Tabs"
4. **Wait 5 seconds** (important!)
5. Check the tab group name - it should show the part number and name
6. Open browser console (F12) to see debug messages like:
   ```
   [SFC Helper] Found part info: 122750-201 ( ASSEMBLY, COMINS, PROD)
   [SFC Helper] Updating group name to: 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs
   ```

### Test Ticket Number Extraction
1. Navigate to: `https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/WR-00104829`
2. Open the extension
3. The "Ticket Number" field should auto-populate with: `WR-00104829`
4. Console should show: `[SFC Helper] Extracted WRM ticket from URL: WR-00104829`

### Test Clean UI
1. Open the extension popup
2. Verify no weird emoji symbols display
3. Headers should be clean text: "SFC Helper", "Ticket Number", etc.

## Key Improvements

| Feature | Before v2.2 | After v2.2 |
|---------|------------|------------|
| Group Tab Names | Not updating with part info | ✅ Shows part number and name |
| Wait Time | 3 seconds | 5 seconds (more reliable) |
| Part Detection | Limited selectors | More selectors (h1-h3, spans, divs) |
| UI Symbols | Weird emoji characters | ✅ Clean text |
| Ticket Extraction | Manual entry only | ✅ Auto-extracts from URL/page |
| Debug Logging | Minimal | ✅ Comprehensive console logs |

## What to Expect

**When opening MES tabs:**
1. Click "Open MES Tabs"
2. Tabs open immediately with default group name
3. **Wait 5 seconds**
4. Group name automatically updates to show part info
5. Console shows extraction progress

**Expected Group Names:**
- Single part: `122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- Multiple parts: `122750-201, 122751-101 - 7 SFCs`
- Many parts: `4 Parts - 12 SFCs`
- No part info: `Custom Name - 5 SFCs`

## Files Modified

- ✅ [manifest.json](manifest.json) - Version bump to 2.2
- ✅ [popup.js](popup.js) - Fixed group naming, added auto-ticket extraction, improved part detection
- ✅ [popup.html](popup.html) - Removed emoji symbols
- ✅ [settings.html](settings.html) - Removed emoji symbols
- ✅ [README.md](README.md) - Updated to v2.2, cleaned up emojis
- ✅ [INSTALLATION.md](INSTALLATION.md) - Updated wait time references
- ✅ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Updated wait time references

## Known Limitations

1. **Part info extraction depends on MES page format**
   - If MES pages don't have part numbers in headers, extraction fails
   - Falls back to SFC count only

2. **5 second wait is fixed**
   - Very slow connections might need longer
   - Can be customized in code (see TROUBLESHOOTING.md)

3. **Ticket number extraction works for specific formats**
   - WRM: `WR-12345` or `WR12345`
   - JIRA: `TEST-12345`
   - Other formats may not be recognized

## Need Help?

- **Check Console**: Press F12 and look for `[SFC Helper]` messages
- **Read Docs**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed guides
- **Verify Wait Time**: Make sure to wait the full 5 seconds after clicking "Open MES Tabs"
- **Test Pattern**: Use browser console to test if part numbers are in the expected format

---

**Version:** 2.2  
**Release Date:** March 14, 2026  
**Status:** Production Ready ✓
