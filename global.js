// global.js
// Global variables and default settings for SFC Helper extension

const DEFAULT_URL_MES = "https://manufacture.prod.mes.kbobjects.com/XMII/CM/KUIPER/App/POD/webapp/index.html?SITE={SITE}&SFC={SFC}";
const DEFAULT_SITE = "S133";
const DEFAULT_URL_JIRA_TICKET = "https://jira.kbobjects.com/browse/TEST-{TICKET}";
const DEFAULT_URL_WRM_TICKET = "https://ui.prod.console.mse.kuiper.amazon.dev/tools/worm/work-requests/{TICKET}"
const JIRA_SFC_CUSTOMFIELD = "#customfield_14006-val";
// Multiple selectors for WRM - more robust against UI changes
const WRM_SFC_SELECTORS = [
  "table tbody tr",  // Generic table rows
  "[class*='table'] tbody tr",  // Tables with 'table' in class
  "textarea",  // Text areas that might contain SFCs
  "input[type='text']",  // Text inputs
  "div[class*='sfc']",  // Divs with 'sfc' in class name
  "span[class*='sfc']",  // Spans with 'sfc' in class name
];


// const TICKET_URL = "https://jira.kbobjects.com/browse/TEST-{TICKET}";