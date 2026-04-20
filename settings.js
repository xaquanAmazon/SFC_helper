document.addEventListener("DOMContentLoaded", () => {
  const defaultUrlTemplateInput = document.getElementById("defaultUrlMes");
  const defaultSiteInput = document.getElementById("defaultSite");
  const defaultUrlJiraTicketInput = document.getElementById("defaultUrlJiraTicket");
  const defaultUrlWrmTicketInput = document.getElementById("defaultUrlWrmTicket");
  const saveButton = document.getElementById("saveSettingsButton");

  const storage = typeof browser !== "undefined" ? browser.storage.sync : chrome.storage.sync;

  storage.get(["defaultUrlTemplate", "defaultSite", "defaultUrlJiraTicket", "defaultUrlWrmTicket"], (result) => {
      defaultUrlTemplateInput.value = result.defaultUrlTemplate || DEFAULT_URL_MES;
      defaultSiteInput.value = result.defaultSite || DEFAULT_SITE;
      defaultUrlJiraTicketInput.value = result.defaultUrlJiraTicket || DEFAULT_URL_JIRA_TICKET;
      defaultUrlWrmTicketInput.value = result.defaultUrlWrmTicket || DEFAULT_URL_WRM_TICKET;
  });

  saveButton.addEventListener("click", () => {
      const defaultUrlTemplate = defaultUrlTemplateInput.value.trim();
      const defaultSite = defaultSiteInput.value.trim();
      const defaultUrlJiraTicket = defaultUrlJiraTicketInput.value.trim();
      const defaultUrlWrmTicket = defaultUrlWrmTicketInput.value.trim();

      storage.set({ defaultUrlTemplate, defaultSite, defaultUrlJiraTicket, defaultUrlWrmTicket}, () => {
          alert("Settings saved!");
      });
  });

  const resetButton = document.getElementById("resetSettingsButton");
  resetButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all settings to defaults?")) {
          defaultUrlTemplateInput.value = DEFAULT_URL_MES;
          defaultSiteInput.value = DEFAULT_SITE;
          defaultUrlJiraTicketInput.value = DEFAULT_URL_JIRA_TICKET;
          defaultUrlWrmTicketInput.value = DEFAULT_URL_WRM_TICKET;
          
          storage.set({ 
              defaultUrlTemplate: DEFAULT_URL_MES, 
              defaultSite: DEFAULT_SITE, 
              defaultUrlJiraTicket: DEFAULT_URL_JIRA_TICKET,
              defaultUrlWrmTicket: DEFAULT_URL_WRM_TICKET
          }, () => {
              alert("Settings reset to defaults!");
          });
      }
  });
});
