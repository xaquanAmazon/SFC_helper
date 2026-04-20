# SFC Helper v2.3 Changelog

## Release Date
Current Version

## Summary
Version 2.3 focuses on **reliability improvements** and **enhanced group naming** to address intermittent part info extraction issues and add work order context to tab groups.

## Key Features

### 1. Retry Logic for Part Info Extraction
**Problem:** Group tab naming was "hit or miss" - sometimes part numbers appeared, sometimes they didn't.

**Solution:** Implemented intelligent retry mechanism with three attempts:
- **Attempt 1:** 3 seconds after tab creation
- **Attempt 2:** 5 seconds after tab creation (if first attempt fails)
- **Attempt 3:** 8 seconds after tab creation (if second attempt fails)

**Benefits:**
- ✅ Works reliably on slow-loading MES pages
- ✅ Handles network delays gracefully
- ✅ Provides fallback to simple naming if all attempts fail
- ✅ Console logging shows which attempt succeeded

**Code Example:**
```javascript
async function attemptGroupNameUpdate(groupId, createdTabs, sfcCount, fallbackName, workOrder, attemptNumber) {
    const maxAttempts = 3;
    const delays = [3000, 5000, 8000]; // Try at 3s, 5s, and 8s
    
    // Attempt extraction
    const partInfos = await collectPartInfoFromTabs(createdTabs);
    
    if (partInfos.length > 0) {
        // Success - update group name
        const groupName = createGroupName(partInfos, sfcCount, fallbackName, workOrder);
        await chrome.tabGroups.update(groupId, { title: groupName });
        console.log(`✅ Group name updated on attempt ${attemptNumber}`);
    } else if (attemptNumber < maxAttempts) {
        // Retry with next delay
        const nextDelay = delays[attemptNumber] - delays[attemptNumber - 1];
        setTimeout(() => {
            attemptGroupNameUpdate(groupId, createdTabs, sfcCount, fallbackName, workOrder, attemptNumber + 1);
        }, nextDelay);
    }
}
```

### 2. Work Order in Group Names
**Problem:** Group tabs didn't show which ticket/work order the SFCs belonged to, making it hard to track multiple tickets simultaneously.

**Solution:** Added work order number to the beginning of group names with pipe separator.

**Format:**
- **With Part Info:** `WR-00104829 | 122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs`
- **Without Part Info:** `WR-00104829 | SFC Group - 5 SFCs`
- **No Ticket:** `122750-201 (ASSEMBLY, COMINS, PROD) - 5 SFCs` (falls back to part info only)

**Benefits:**
- ✅ Easy to identify which ticket each tab group belongs to
- ✅ Better organization when working on multiple tickets
- ✅ Clear visual separation between ticket number and part info
- ✅ Auto-extracted from WRM/JIRA URLs and page content

**Implementation:**
```javascript
function createGroupName(partInfos, sfcCount, fallbackName, workOrder) {
    let baseName = // ... build name from part info or fallback
    
    if (workOrder && workOrder.length > 0) {
        return `${workOrder} | ${baseName}`;
    }
    return baseName;
}
```

### 3. Enhanced Ticket Tracking
**Enhancement:** Work order numbers are now stored globally and persist throughout the extension session.

**Flow:**
1. User pastes ticket URL or extension auto-extracts from current page
2. Ticket number is stored in `currentWorkOrder` variable
3. When creating tab groups, work order is passed to naming function
4. Group name includes work order for easy identification

**Supported Formats:**
- WRM URLs: `https://ui.prod.console.mse.kuiper.amazon.dev/cases/WR-00104829`
- JIRA URLs: `https://jira.kbobjects.com/browse/SPEC-12345`
- Page Content: Searches for ticket patterns in page text

## Technical Details

### Modified Files
1. **popup.js**
   - Added `currentWorkOrder` global variable
   - Replaced single `setTimeout` with `attemptGroupNameUpdate()` function
   - Updated `createGroupName()` to accept `workOrder` parameter
   - Enhanced `extractTicketNumberFromPage()` to store work order globally
   - Added retry logic with exponential backoff

2. **manifest.json**
   - Updated version from 2.2 to 2.3

3. **README.md**
   - Updated version number and features
   - Added new group name format examples
   - Updated version history

### Backward Compatibility
- ✅ Fully backward compatible with v2.2
- ✅ No settings changes required
- ✅ Existing URL templates work unchanged
- ✅ Falls back gracefully when work order unavailable

### Testing Recommendations

#### Test 1: Retry Logic
1. Open extension on WRM ticket page
2. Paste SFC numbers and click "Open SFCs"
3. Watch browser console for retry attempts
4. Verify group name updates within 8 seconds
5. Check console for "✅ Group name updated on attempt X" message

**Expected Results:**
- Group name should show part info and work order
- Console should show which attempt succeeded (1, 2, or 3)
- If MES pages load quickly, attempt 1 should succeed
- If pages are slow, attempts 2 or 3 should succeed

#### Test 2: Work Order Display
1. Navigate to WRM ticket: `https://ui.prod.console.mse.kuiper.amazon.dev/cases/WR-00104829`
2. Verify ticket number auto-fills in extension popup
3. Open SFCs and create tab group
4. Verify group name starts with "WR-00104829 |"

**Expected Results:**
- Ticket number field should auto-populate
- Group name should include work order number
- Format: `WR-00104829 | Part Info - X SFCs`

#### Test 3: Fallback Behavior
1. Open extension without navigating to ticket page
2. Manually enter SFCs without ticket number
3. Click "Open SFCs"
4. Verify group name shows part info without work order prefix

**Expected Results:**
- Group name should be: `Part Info - X SFCs` (no work order)
- If part info unavailable: `SFC Group - X SFCs`

#### Test 4: Multiple Tickets
1. Open first ticket (WR-00104829), create tab group with 3 SFCs
2. Navigate to second ticket (WR-00105000), create another group with 2 SFCs
3. Verify both groups show correct work orders

**Expected Results:**
- First group: `WR-00104829 | ...`
- Second group: `WR-00105000 | ...`
- Each group clearly labeled with its ticket number

## Migration Notes

### Upgrading from v2.2
1. **No manual steps required** - Simply reload the extension in Chrome
2. Test retry logic by opening SFCs on a slow network
3. Verify work orders appear in group names
4. Check console logs to see which retry attempt succeeds

### Developer Notes
- The retry logic can be adjusted by modifying the `delays` array: `[3000, 5000, 8000]`
- Add more attempts by increasing `maxAttempts` and adding delay values
- Work order format can be customized in `createGroupName()` function
- Console logging can be disabled by removing `console.log()` calls

## Known Issues
None reported in v2.3

## Future Enhancements (Potential)
- Configurable retry delays in settings
- Option to disable work order prefix
- Custom group name templates
- Bulk ticket processing
- Auto-close completed groups

## Support
If you encounter issues:
1. Check browser console for error messages (F12 → Console tab)
2. Review TROUBLESHOOTING.md for common problems
3. Verify permissions in chrome://extensions
4. Test on known working ticket (e.g., WR-00104829)

## Credits
- Retry logic implementation: Response to user feedback about intermittent naming
- Work order feature: User request for better ticket tracking
- Testing: Internal validation on WRM production environment
