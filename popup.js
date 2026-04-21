// popup.js
// This script handles the popup behavior for the SFC Helper extension

let jira_SFCs;
let storedSiteID;
let storedUrlMes;
let storedUrlJiraTicket;
let storedUrlWrmTicket;
let defaultGroupName = "No Name";
let currentWorkOrder = ""; // Track current work order/ticket number

const curBrowser = isChrome() ? chrome : browser

document.addEventListener("DOMContentLoaded", async function() {

  let [tab] = await curBrowser.tabs.query({ active: true, currentWindow: true });
  if (tab) {

    const groupNameInput = document.getElementById("groupName");
    groupNameInput.value = tab.title || defaultGroupName;

    curBrowser.storage.sync.get(["defaultUrlTemplate", "defaultSite", "defaultUrlJiraTicket"], (result) => {
      storedUrlMes = (result.defaultUrlTemplate || DEFAULT_URL_MES)
      storedSiteID = (result.defaultSite || DEFAULT_SITE);
      storedUrlJiraTicket = (result.defaultUrlJiraTicket || DEFAULT_URL_JIRA_TICKET);
      storedUrlWrmTicket = (result.defaultUrlWrmTicket || DEFAULT_URL_WRM_TICKET);

      setWorkingSite(storedSiteID);      
      setUrlMesTemplate(storedUrlMes);
      
    });

    if (isJiraWebsite() || isWrmWebsite())
    {
      readSFCsFromTicket();
      extractTicketNumberFromPage();
    }
    
  }
  

  document.getElementById("openTicketButton").addEventListener("click", async function() {
    const ticketNumber = getTicketNumber();
    if (!ticketNumber) {
        alert("Please enter a ticket number.");
        return;
    }

    const url = getUrlWithTicketNumber(ticketNumber);

    curBrowser.tabs.create({ url });
  });

  document.getElementById("openTabsButton").addEventListener("click", async function() {
    const inputString = getSFCs();
    const urlTemplate = document.getElementById("urlMesTemplate").value.trim();
    let groupName = document.getElementById("groupName").value.trim() || "SFC Group";
    const isAutoLoaded = document.getElementById("sfcString").dataset.autoLoaded === "true";
    
    if (!inputString || !urlTemplate) {
      alert("Please enter both input string and URL template.");
      return;
    }
    
    const parts = inputString.split(/\s+/).filter(p => p.length > 0);
    let tabIds = [];
    let groupId;
    let createdTabs = [];

    if (jira_SFCs == inputString) {
      let [currentTab] = await curBrowser.tabs.query({ active: true, currentWindow: true });
      if (currentTab && isAutoLoaded) {
        tabIds.push(currentTab.id);
      }
    }else{
      groupName = defaultGroupName;
    }
    
    // Create all tabs first
    for (const part of parts) {
      if (part.length <= 0) {
        continue;
      }
      const url = getMesUrlWithSFC(encodeURIComponent(part.trim()));
      let tab = await curBrowser.tabs.create({ 
        url: url,
        active: false
      });
      tabIds.push(tab.id);
      createdTabs.push(tab);
    }

    // Create the group first with initial name
    groupId = await createAndNameGroup(tabIds, groupName);
    
    // Get the current work order/ticket number
    const workOrder = document.getElementById("ticketNumber").value.trim() || currentWorkOrder;
    
    // Wait for pages to load before extracting part info and updating group name
    // Try multiple times with increasing delays for better reliability
    attemptGroupNameUpdate(groupId, createdTabs, parts.length, groupName, workOrder, 1);
    
  });

  document.getElementById("copyLinksButton").addEventListener("click", function() {
    const copyButton = this; // Reference the button
    const originalText = copyButton.innerText; // Store original button text

    const inputString = getSFCs();
    const urlMesTemplate = getUrlMesTemplate();

    if (!inputString || !urlMesTemplate) {
        alert("Please enter both input string and URL template.");
        return;
    }
    const parts = inputString.split(/\s+/);

    // Generate HTML and Plain Text formats
    const htmlLinks = parts.map(part => `<p><a href="${getMesUrlWithSFC(encodeURIComponent(part))}" target="_blank">${part}</a></p>`).join("\n");
    const plainTextLinks = parts.map(part => `${part}`).join("\n");

    // Store both plain text and HTML in clipboard
    const htmlBlob = new Blob([htmlLinks], { type: 'text/html' });
    const textBlob = new Blob([plainTextLinks], { type: 'text/plain' });

    const clipboardData = [new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
    })];

    navigator.clipboard.write(clipboardData).then(() => {
        // Change button text to "Copied!"
        copyButton.innerText = "Copied!";
        copyButton.disabled = true;

        // Reset button text after 2 seconds
        setTimeout(() => {
            copyButton.innerText = originalText;
            copyButton.disabled = false;
        }, 2000);
    }).catch(err => {
        console.error("Failed to copy links:", err);
    });
  });

  function isWrmWebsite(){
    return tab.url.includes("worm");
  }

  function isWrmTicket(ticket){
    return ticket.includes("WR");
  }

  function isJiraWebsite(){
    return tab.url.includes(".jira")
  }

  
  function getUrlMesTemplate(){
    return document.getElementById("urlMesTemplate").value.trim();
  }

  function setUrlMesTemplate(val){
    document.getElementById("urlMesTemplate").value = val;
  }

  function getTicketNumber() {
    return document.getElementById("ticketNumber").value.trim().toUpperCase();
  }

  function getUrlWithTicketNumber(ticketNumber) {
    let url;

    if (isWrmTicket(ticketNumber)) {
      ticketNumber = formatWrmTicketNumber(ticketNumber);
      url = storedUrlWrmTicket;
    } else {
      url = storedUrlJiraTicket;
    }

    return url.replace("{TICKET}", encodeURIComponent(ticketNumber));
    
  }  

  function getMesUrlWithSFC(SFC){
    let url = storedUrlMes;
    url = url.replace("{SITE}", getWorkingSite());
    url = url.replace("{SFC}", SFC);

    return url;
  }

  function getWorkingSite(){
    let siteId = document.getElementById("workingSite").value.trim();

    if (storedSiteID != siteId) {
      return siteId;
    }
    
    return storedSiteID;
  }

  function setWorkingSite(val){
    document.getElementById("workingSite").value = val;
  }

  async function readSFCsFromTicket(){
    let args = {customFieldId: JIRA_SFC_CUSTOMFIELD};
    let searchFunc = searchSFCsJira;

    if (isWrmWebsite()) {
      args.selectors = WRM_SFC_SELECTORS;
      searchFunc = searchSFCsWRM
    }
 
    if (isChrome()) {
      curBrowser.scripting.executeScript({
        target: { tabId: tab.id },
        args: [args],
        func: searchFunc
      }).then(parsingSFCs).catch(error => {
        console.error('[SFC Helper] Error extracting SFCs:', error);
        // Show user-friendly message
        const sfcTextArea = document.getElementById("sfcString");
        if (sfcTextArea.value.trim().length === 0) {
          sfcTextArea.placeholder = "Could not auto-load SFCs. Please enter manually or refresh the ticket page.";
        }
      });
    }else{
      curBrowser.tabs.executeScript(tab.id, {
        code: `const listElement = document.querySelector(${args.customFieldId});
                if (listElement) {
                  return Array.from(listElement.querySelectorAll("li span"))
                    .map(span => span.textContent.trim())
                    .join("\n");
                };
              `,
      }).then((result)=>{
        alert(result);
      });
    }
    
  }

  async function extractTicketNumberFromPage() {
    // Extract ticket number from URL or page content
    try {
      // First try to extract from URL
      if (tab.url.includes("worm")) {
        // WRM URL format: .../work-requests/WR-00104829
        const urlMatch = tab.url.match(/work-requests\/(WR-?\d+)/i);
        if (urlMatch) {
          const ticketNum = urlMatch[1].replace('WR-', 'WR').replace('WR', 'WR-');
          document.getElementById("ticketNumber").value = ticketNum;
          currentWorkOrder = ticketNum; // Store the work order
          console.log('[SFC Helper] Extracted WRM ticket from URL:', ticketNum);
          return;
        }
      } else if (tab.url.includes("jira.")) {
        // JIRA URL format: .../browse/TEST-21506
        const urlMatch = tab.url.match(/browse\/[A-Z]+-(\d+)/);
        if (urlMatch) {
          const ticketNum = urlMatch[1];
          document.getElementById("ticketNumber").value = ticketNum;          currentWorkOrder = ticketNum; // Store the work order          console.log('[SFC Helper] Extracted JIRA ticket from URL:', ticketNum);
          return;
        }
      }

      // Fallback: Try to extract from page content
      if (isChrome()) {
        curBrowser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Try to find WR ticket number on the page
            const wrmPattern = /WR[-\s]?\d{5,8}/i;
            const jiraPattern = /[A-Z]+-\d+/;
            
            // Check page title first
            let match = document.title.match(wrmPattern) || document.title.match(jiraPattern);
            if (match) return match[0];
            
            // Check headers
            const headers = document.querySelectorAll('h1, h2, h3');
            for (const header of headers) {
              match = header.textContent.match(wrmPattern) || header.textContent.match(jiraPattern);
              if (match) return match[0];
            }
            
            // Check entire page as fallback
            match = document.body.textContent.match(wrmPattern);
            return match ? match[0] : '';
          }
        }).then(results => {
          if (results && results[0] && results[0].result) {
            const ticketNum = results[0].result.trim();
            if (ticketNum) {
              document.getElementById("ticketNumber").value = ticketNum;
              currentWorkOrder = ticketNum; // Store the work order
              console.log('[SFC Helper] Extracted ticket from page:', ticketNum);
            }
          }
        }).catch(error => {
          console.log('[SFC Helper] Could not extract ticket number:', error);
        });
      }
    } catch (error) {
      console.error('[SFC Helper] Error extracting ticket number:', error);
    }
  }

  
  async function searchSFCsJira(data){
    console.log('[SFC Helper] Searching for SFCs in JIRA ticket using custom field and fallback strategies...');
    // First try the custom field
    const listElement = document.querySelector(data.customFieldId);
    if (listElement) {
      const sfcs = Array.from(listElement.querySelectorAll("li span"))
        .map(span => span.textContent.trim())
        .filter(text => text.length > 0)
        .join("\n");
      
      if (sfcs.length > 0) {
        console.log('[SFC Helper] Found SFCs in custom field:', sfcs.split('\n').length);
        return sfcs;
      }
    }
    
    // Fallback: Use regex pattern to find SFCs anywhere on the page
    const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{10,20}\b/gi;
    const allSFCs = new Set();
    
    // Search in the page content
    const pageText = document.body.textContent;
    const matches = pageText.match(sfcPattern);
    if (matches) {
      matches.forEach(sfc => allSFCs.add(sfc.toUpperCase()));
    }
    
    const sfcArray = Array.from(allSFCs).sort();
    console.log('[SFC Helper] Found SFCs via fallback:', sfcArray.length);
    return sfcArray.join("\n");
  }

  function formatWrmTicketNumber(ticketNumber) {
    // Remove any existing hyphen and split between letters and numbers
    const cleanTicket = ticketNumber.replace('-', '');
    const prefix = cleanTicket.match(/[A-Za-z]+/)[0];
    const number = cleanTicket.match(/\d+/)[0];
    
    // Convert prefix to uppercase
    const upperPrefix = prefix.toUpperCase();
    
    // Pad the number with leading zeros to make it 8 digits
    const paddedNumber = number.padStart(8, '0');
    
    // Combine them back with a hyphen
    return `${upperPrefix}-${paddedNumber}`;
}


  function searchSFCsWRM(data){
    console.log('[SFC Helper] Searching for SFCs in WRM page using multiple strategies...');
    // Try multiple strategies to find SFCs in the WRM page
    // Pattern matches: 7+ digits, hyphen, 1-20 alphanumeric chars (e.g., 1250649-GPE3GV5460940141, 1270378-35936)
    const sfcPattern = /\b\d{7,}\-[A-Za-z0-9]{1,20}\b/gi;
    const allSFCs = new Set();
    
    // Strategy 1: Search in table cells (most common location)
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        const text = cell.textContent;
        const matches = text.match(sfcPattern);
        if (matches) {
          console.log('[SFC Helper] Found SFCs in table cell:', matches);
          matches.forEach(sfc => allSFCs.add(sfc.toUpperCase()));
        }
      });
    });
    
    // Strategy 2: Search in text areas and inputs (might have SFC lists)
    const textFields = document.querySelectorAll('textarea, input[type="text"]');
    textFields.forEach(field => {
      const text = field.value || field.textContent;
      const matches = text.match(sfcPattern);
      if (matches) {
        console.log('[SFC Helper] Found SFCs in text field:', matches);
        matches.forEach(sfc => allSFCs.add(sfc.toUpperCase()));
      }
    });
    
    // Strategy 3: Search entire page as fallback (only if no SFCs found yet)
    if (allSFCs.size === 0) {
      const allText = document.body.textContent;
      const matches = allText.match(sfcPattern);
      if (matches) {
        console.log('[SFC Helper] Found SFCs in page text:', matches);
        matches.forEach(sfc => allSFCs.add(sfc.toUpperCase()));
      }
    }
    
    // Strategy 4: Look for specific data attributes or aria labels related to SFCs
    const sfcElements = document.querySelectorAll('[data-sfc], [aria-label*="SFC"], [class*="sfc"]');
    sfcElements.forEach(element => {
      const text = element.textContent || element.getAttribute('data-sfc') || '';
      const matches = text.match(sfcPattern);
      if (matches) {
        console.log('[SFC Helper] Found SFCs in specially marked elements:', matches);
        matches.forEach(sfc => allSFCs.add(sfc.toUpperCase()));
      }
    });
    
    // Convert Set to array and join with newlines
    const sfcArray = Array.from(allSFCs).sort();
    console.log('[SFC Helper] Found', sfcArray.length, 'SFCs:', sfcArray);  // Debug logging
    return sfcArray.join("\n");
  }

  function parsingSFCs(results){
    let inputStringVal = getSFCs();
    if (results && results[0] && results[0].result && inputStringVal.length <= 0) {
      let sfcs = results[0].result.trim();

      if (sfcs.length > 0) {
        document.getElementById("sfcString").dataset.autoLoaded = "true";
        setSFCs(sfcs);
        jira_SFCs = sfcs;
        
        // Count the number of SFCs loaded
        const sfcCount = sfcs.split('\n').filter(s => s.trim().length > 0).length;
        console.log(`[SFC Helper] Auto-loaded ${sfcCount} SFC(s) from ticket`);
        
        // Optional: Show a subtle notification to the user
        const sfcTextArea = document.getElementById("sfcString");
        sfcTextArea.style.borderColor = "#4CAF50";
        setTimeout(() => {
          sfcTextArea.style.borderColor = "";
        }, 2000);
      } else {
        console.log('[SFC Helper] No SFCs found in ticket');
        document.getElementById("sfcString").dataset.autoLoaded = "false";
      }
    } else {
      document.getElementById("sfcString").dataset.autoLoaded = "false";
    }
  }

  function getSFCs(){
    return document.getElementById("sfcString").value.trim().toUpperCase();
  }

  function setSFCs(val){
    document.getElementById("sfcString").value = val;
  }

  async function createAndNameGroup(tabIds, groupName) {
    if (isChrome() == false) {
      return null;
    }
    const groupId = await curBrowser.tabs.group({ tabIds });
    await curBrowser.tabGroups.update(groupId, { title: groupName });
    return groupId;
  }
  
  async function updateGroupName(groupId, groupName) {
    if (isChrome() == false || !groupId) {
      return;
    }
    await curBrowser.tabGroups.update(groupId, { title: groupName });
    console.log('[SFC Helper] Group name updated to:', groupName);
  }

  // Attempt to update group name with retry logic for better reliability
  async function attemptGroupNameUpdate(groupId, createdTabs, sfcCount, fallbackName, workOrder, attemptNumber) {
    const maxAttempts = 3;
    const delays = [3000, 5000, 8000]; // Try at 3s, 5s, and 8s
    
    if (attemptNumber > maxAttempts) {
      console.log('[SFC Helper] Max attempts reached, using fallback name');
      const finalName = createGroupName([], sfcCount, fallbackName, workOrder);
      await updateGroupName(groupId, finalName);
      return;
    }
    
    const delay = delays[attemptNumber - 1];
    console.log(`[SFC Helper] Attempt ${attemptNumber}/${maxAttempts}: Waiting ${delay}ms before extracting part info...`);
    
    setTimeout(async () => {
      try {
        const partInfo = await collectPartInfoFromTabs(createdTabs);
        const validPartInfo = partInfo.filter(info => info.partNumber && info.partName);
        
        if (validPartInfo.length > 0) {
          // Successfully found part info
          const finalGroupName = createGroupName(partInfo, sfcCount, fallbackName, workOrder);
          console.log('[SFC Helper] Successfully extracted part info, updating group name to:', finalGroupName);
          await updateGroupName(groupId, finalGroupName);
        } else {
          // No part info found, try again if attempts remain
          console.log(`[SFC Helper] No part info found on attempt ${attemptNumber}, retrying...`);
          if (attemptNumber < maxAttempts) {
            attemptGroupNameUpdate(groupId, createdTabs, sfcCount, fallbackName, workOrder, attemptNumber + 1);
          } else {
            // Final attempt failed, use fallback
            const finalGroupName = createGroupName([], sfcCount, fallbackName, workOrder);
            console.log('[SFC Helper] All attempts failed, using fallback name:', finalGroupName);
            await updateGroupName(groupId, finalGroupName);
          }
        }
      } catch (error) {
        console.error(`[SFC Helper] Error on attempt ${attemptNumber}:`, error);
        if (attemptNumber < maxAttempts) {
          attemptGroupNameUpdate(groupId, createdTabs, sfcCount, fallbackName, workOrder, attemptNumber + 1);
        }
      }
    }, delay);
  }
});

function isChrome() {
  // Using navigator.userAgent
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1) {
      return true
  }

  return false;
}

// Collect part information from MES tabs
async function collectPartInfoFromTabs(tabs) {
  const partInfos = [];
  
  for (const tab of tabs) {
    try {
      if (isChrome()) {
        const results = await curBrowser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Try to extract part info directly from the page
            // Look for patterns like: 122750-201 ( ASSEMBLY, COMINS, PROD)
            const selectors = ['h1', 'h2', 'h3', '.page-title', '[class*="header"]', 'header', '[role="banner"]', 'span', 'div'];
            for (const selector of selectors) {
              const elements = document.querySelectorAll(selector);
              for (const element of elements) {
                const text = element.textContent.trim();
                // Match format: PARTNUMBER (PART NAME)
                const match = text.match(/([\d\-]+)\s*\(\s*([^)]+)\s*\)/);
                if (match && match[1].includes('-')) {
                  console.log('[SFC Helper] Found part info:', match[0]);
                  return { partNumber: match[1].trim(), partName: match[2].trim(), fullText: match[0] };
                }
              }
            }
            console.log('[SFC Helper] No part info found on this page');
            return { partNumber: "", partName: "", fullText: "" };
          }
        });
        
        if (results && results[0] && results[0].result) {
          partInfos.push(results[0].result);
        }
      }
    } catch (error) {
      console.log("Error extracting part info:", error);
    }
  }
  
  return partInfos;
}

// Create a group name based on part information and SFC count
function createGroupName(partInfos, sfcCount, fallbackName, workOrder) {
  // Filter out empty part infos
  const validPartInfos = partInfos.filter(info => info.partNumber && info.partName);
  
  let baseName = "";
  
  if (validPartInfos.length === 0) {
    baseName = `${fallbackName} - ${sfcCount} SFC${sfcCount !== 1 ? 's' : ''}`;
  } else {
    // Get unique part numbers
    const uniqueParts = {};
    validPartInfos.forEach(info => {
      const key = `${info.partNumber}`;
      if (!uniqueParts[key]) {
        uniqueParts[key] = info;
      }
    });
    
    const uniquePartArray = Object.values(uniqueParts);
    
    // If all SFCs are for the same part number, use full part info
    if (uniquePartArray.length === 1) {
      const info = uniquePartArray[0];
      baseName = `${info.partNumber} (${info.partName}) - ${sfcCount} SFC${sfcCount !== 1 ? 's' : ''}`;
    } 
    // If multiple part numbers (up to 3), list them
    else if (uniquePartArray.length <= 3) {
      const partNumbers = uniquePartArray.map(info => info.partNumber).join(', ');
      baseName = `${partNumbers} - ${sfcCount} SFC${sfcCount !== 1 ? 's' : ''}`;
    } 
    // If more than 3 different parts, just show count
    else {
      baseName = `${uniquePartArray.length} Parts - ${sfcCount} SFC${sfcCount !== 1 ? 's' : ''}`;
    }
  }
  
  // Add work order to the name if available
  if (workOrder && workOrder.length > 0) {
    return `${workOrder} | ${baseName}`;
  }
  
  return baseName;
}
