# 🔍 SFC Pattern Quick Reference

## What Format Does the Extension Recognize?

The SFC Helper extension uses a **regex pattern** to automatically detect and extract SFC numbers from JIRA and WRM ticket pages.

### Current Pattern
```regex
/\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi
```

### What This Means
- `\b` - Word boundary (start)
- `\d{7,}` - **7 or more digits** (the first part of the SFC)
- `\-` - A **hyphen** (dash character)
- `[A-Za-z0-9]{10,20}` - **10 to 20 alphanumeric characters** (letters A-Z, a-z, or digits 0-9)
- `\b` - Word boundary (end)
- `/gi` - Global search, case-insensitive

### Examples That Match ✅

| SFC Number | Explanation |
|------------|-------------|
| `1250649-GPE3GV5460940141` | ✅ 7 digits + hyphen + 17 alphanumeric chars |
| `9876543-ABC1234567890` | ✅ 7 digits + hyphen + 15 alphanumeric chars |
| `12345678-XYZABC1234` | ✅ 8 digits + hyphen + 11 alphanumeric chars |
| `1111111-AAAAAAAAAA` | ✅ 7 digits + hyphen + 10 alphanumeric chars (minimum) |
| `9999999-AAAAAAAAAAAAAAAAAAAA` | ✅ 7 digits + hyphen + 20 alphanumeric chars (maximum) |

### Examples That DON'T Match ❌

| Text | Why It Doesn't Match |
|------|----------------------|
| `123456-ABC123` | ❌ Only 6 digits (need 7+) |
| `1234567ABC123456` | ❌ No hyphen |
| `1234567-ABC` | ❌ Only 3 chars after hyphen (need 10+) |
| `1234567-ABCDEFGHIJKLMNOPQRSTUVWXYZ` | ❌ 26 chars after hyphen (max is 20) |
| `ABC1234567-123456789` | ❌ Starts with letters instead of digits |
| `1234567-ABC@#$%` | ❌ Contains special characters (@#$%) |

## Where Does the Extension Look?

The extension searches for SFCs in these locations (in order of priority):

### For WRM Tickets
1. **Table cells** (`<td>`, `<th>`)
2. **Text inputs and textareas** (`<input>`, `<textarea>`)
3. **Entire page body** (fallback)
4. **Elements with SFC attributes** (`[data-sfc]`, `[class*="sfc"]`, etc.)

### For JIRA Tickets
1. **Custom field** (`#customfield_14006-val`)
2. **Entire page body** (fallback with regex pattern)

## Testing Your SFCs

Want to test if your SFC numbers match the pattern? Open your browser console (F12) on any page and paste:

```javascript
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
const testSFCs = [
  "1250649-GPE3GV5460940141",  // Your SFC here
  "9876543-ABC1234567890",     // Add more to test
];

testSFCs.forEach(sfc => {
  const matches = sfc.match(sfcPattern);
  console.log(`${sfc}: ${matches ? '✅ MATCHES' : '❌ NO MATCH'}`);
});
```

## Need to Customize the Pattern?

If your SFCs have a different format, you can modify the pattern in two places:

### 1. For WRM Extraction ([popup.js](popup.js) line ~265)
```javascript
function searchSFCsWRM(data){
  // Change this pattern to match your SFC format
  const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
  // ... rest of function
}
```

### 2. For JIRA Fallback ([popup.js](popup.js) line ~237)
```javascript
async function searchSFCsJira(data){
  // Change this pattern to match your SFC format
  const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
  // ... rest of function
}

### Common Customizations

#### Allow Fewer Digits (e.g., 5+ instead of 7+)
```javascript
const sfcPattern = /\b\d{5,}\-[A-Za-z0-9]{10,20}\b/gi;
```

#### Allow Longer Suffix (e.g., up to 30 characters)
```javascript
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,30}\b/gi;
```

#### Allow Shorter Suffix (e.g., 5+ characters)
```javascript
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{5,20}\b/gi;
```

#### Allow Underscores Instead of Hyphens
```javascript
const sfcPattern = /\b\d{7,}_[A-Za-z0-9]{10,20}\b/gi;
```

#### Allow Both Hyphens and Underscores
```javascript
const sfcPattern = /\b\d{7,}[\-_][A-Za-z0-9]{10,20}\b/gi;
```

#### Allow Special Characters in Suffix
```javascript
// Allows hyphens, underscores, and dots in the suffix
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9\-_.]{10,20}\b/gi;
```

## Real-World Example

Given a WRM ticket page with this table:

| ID | SFC | Status | Date |
|----|-----|--------|------|
| 1 | 1250649-GPE3GV5460940141 | Complete | 2024-03-01 |
| 2 | 1250650-GPE3GV5460940142 | In Progress | 2024-03-02 |
| 3 | 1250651-GPE3GV5460940143 | Pending | 2024-03-03 |

The extension will:
1. Find the `<table>` element
2. Loop through all `<td>` cells
3. Apply the regex pattern to each cell's text
4. Extract: `1250649-GPE3GV5460940141`, `1250650-GPE3GV5460940142`, `1250651-GPE3GV5460940143`
5. Remove duplicates (using a Set)
6. Sort alphabetically
7. Display in the extension popup

## Debugging Tips

### See What the Extension Found
1. Open a WRM/JIRA ticket
2. Open the extension popup (click the icon)
3. Press F12 to open browser Developer Tools
4. Click the **Console** tab
5. Look for messages like:
   ```
   [SFC Helper] Found 3 SFCs: ["1250649-GPE3GV5460940141", ...]
   ```

### Test Pattern on Live Page
On the WRM/JIRA page, open console (F12) and run:
```javascript
const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
const allText = document.body.textContent;
const matches = allText.match(sfcPattern);
console.log('Found SFCs:', matches);
```

### Check If SFCs Are in a Table
```javascript
const tables = document.querySelectorAll('table');
tables.forEach((table, index) => {
  console.log(`Table ${index}:`, table.textContent);
});
```

## Summary

- ✅ Extension looks for: **7+ digits** + **hyphen** + **10-20 alphanumeric chars**
- ✅ Case-insensitive (matches both uppercase and lowercase)
- ✅ Searches multiple locations (tables, inputs, page body)
- ✅ Removes duplicates automatically
- ✅ Results sorted alphabetically
- ✅ Debug with browser console (F12)

---

Need more help? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed guides.

**Current Version:** v2.1  
**Last Updated:** March 2026
