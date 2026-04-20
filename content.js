// content.js
// Content script to extract part number and name from MES pages

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPartInfo") {
    const partInfo = extractPartInfo();
    sendResponse(partInfo);
  }
  return true;
});

function extractPartInfo() {
  // Try multiple selectors to find the part number and name
  // Looking for patterns like: "122750-201 ( ASSEMBLY, COMINS, PROD)"
  
  // Common locations for part info in MES systems
  const selectors = [
    '.header-part-info',
    '.part-number',
    'h1',
    'h2',
    '.page-title',
    '[class*="part"]',
    '[class*="header"]'
  ];
  
  let partNumber = "";
  let partName = "";
  
  // Try to find the part info in various header elements
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent.trim();
      
      // Pattern: PARTNUMBER (PART NAME)
      // Example: 122750-201 ( ASSEMBLY, COMINS, PROD)
      const match = text.match(/^([\w\-]+)\s*\(\s*(.+?)\s*\)$/);
      if (match) {
        partNumber = match[1].trim();
        partName = match[2].trim();
        return { partNumber, partName, fullText: text };
      }
      
      // Alternative pattern: Look for part number like format at the beginning
      const partMatch = text.match(/^([\d\-]+)\s+\(\s*([^)]+)\s*\)/);
      if (partMatch) {
        partNumber = partMatch[1].trim();
        partName = partMatch[2].trim();
        return { partNumber, partName, fullText: text };
      }
    }
  }
  
  // If no match found, try to look in the entire page header area
  const headerArea = document.querySelector('header') || document.querySelector('[role="banner"]');
  if (headerArea) {
    const text = headerArea.textContent.trim();
    const match = text.match(/([\d\-]+)\s*\(\s*([^)]+)\s*\)/);
    if (match) {
      partNumber = match[1].trim();
      partName = match[2].trim();
      return { partNumber, partName, fullText: match[0] };
    }
  }
  
  return { partNumber: "", partName: "", fullText: "" };
}

// Auto-extract on page load and store in the page
window.addEventListener('load', () => {
  const partInfo = extractPartInfo();
  // Store in window object for later retrieval
  window.__mesPartInfo = partInfo;
});
