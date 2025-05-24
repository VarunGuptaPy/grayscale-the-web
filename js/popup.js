function toggleAllSites() {
  // console.log('toggle all sites')
  var checkbox = document.getElementById("all-sites-toggle");
  chrome.storage.sync.get(
    ["gsAll", "gsExcluded", "gsSites", "gsTabs"],
    function (val) {
      chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        function (tabs) {
          var hostname = getDomainFromTabs(tabs);
          if (val.gsAll) {
            checkbox.checked = false;
            chrome.storage.sync.set({ gsAll: false });
            if (
              val.gsSites.indexOf(hostname) == -1 &&
              val.gsTabs.indexOf(tabs[0].id) == -1
            ) {
              // console.log('tab not on and site not saved, turn off gray');
              chrome.tabs.sendMessage(tabs[0].id, { type: "turnOffGray" });
              turnIconOff();
            }
          } else {
            checkbox.checked = true;
            chrome.storage.sync.set({ gsAll: true });
            if (val.gsExcluded.indexOf(hostname) == -1) {
              // console.log('site not excluded, turn on gray');
              chrome.tabs.sendMessage(tabs[0].id, { type: "turnOnGray" });
              turnIconOn();
            }
          }
        }
      );
    }
  );
}

function toggleTab() {
  // console.log('toggle tab')
  var checkbox = document.getElementById("this-tab-toggle");
  chrome.storage.sync.get(
    ["gsAll", "gsExcluded", "gsSites", "gsTabs"],
    function (val) {
      if (checkbox.checked) {
        // console.log('toggle tab checked');
        addCurrentTab();
      } else {
        // console.log('toggle tab not checked');
        chrome.tabs.query(
          { active: true, lastFocusedWindow: true },
          function (tabs) {
            var hostname = getDomainFromTabs(tabs);
            removeCurrentTab();
          }
        );
      }
    }
  );
}

function openOptionsPage() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
}

function onLoad() {
  var bodyEl = document.querySelector("body");

  // Initialize all event listeners
  document
    .getElementById("this-tab-toggle")
    .addEventListener("change", toggleTab);
  document
    .getElementById("all-sites-toggle")
    .addEventListener("change", toggleAllSites);
  document
    .getElementById("temporary-ungrayscale-toggle")
    .addEventListener("change", toggleTemporaryUngrayscale);

  document
    .getElementById("add-saved-site")
    .addEventListener("click", addCurrentSite);
  document
    .getElementById("remove-saved-site")
    .addEventListener("click", removeCurrentSite);
  document
    .getElementById("saved-help-toggle")
    .addEventListener("click", toggleHelp);

  document
    .getElementById("add-excluded-site")
    .addEventListener("click", addCurrentSiteExcluded);
  document
    .getElementById("remove-excluded-site")
    .addEventListener("click", removeCurrentSiteExcluded);
  document
    .getElementById("excluded-help-toggle")
    .addEventListener("click", toggleHelp);

  document
    .querySelector(".manage-sites")
    .addEventListener("click", openOptionsPage);

  updatePopUpDetails();
  setTimeout(() => {
    bodyEl.classList.remove("preload");
  }, 50);
}

function updatePopUpDetails() {
  var allSitesCheckbox = document.getElementById("all-sites-toggle");
  var thisTabCheckbox = document.getElementById("this-tab-toggle");
  var tempUngrayscaleCheckbox = document.getElementById(
    "temporary-ungrayscale-toggle"
  );
  var savedSiteStatus = document.getElementById("saved-site-status");
  var excludedSiteStatus = document.getElementById("excluded-site-status");
  var savedAddRemoveContainer = document.getElementById("saved-container");
  var excludedAddRemoveContainer =
    document.getElementById("excluded-container");
  var currentSiteName = document.getElementById("current-site-name");

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    var url = tabs[0].url;
    var hostname = extractRootDomain(url);
    currentSiteName.innerHTML = hostname;

    // Get all states at once
    chrome.storage.sync.get(
      ["gsAll", "gsExcluded", "gsSites", "gsTabs"],
      function (val) {
        // Get temporary ungrayscale state
        chrome.storage.local.get(["gsTempUngrayscale"], function (tempVal) {
          const tempUngrayscale = tempVal.gsTempUngrayscale || [];

          // Update all toggles
          allSitesCheckbox.checked = val.gsAll || false;
          thisTabCheckbox.checked =
            (val.gsTabs && val.gsTabs.indexOf(tabs[0].id) > -1) || false;
          tempUngrayscaleCheckbox.checked =
            tempUngrayscale.includes(tabs[0].id) || false;

          // Update saved site status
          if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
            savedSiteStatus.innerHTML = "Saved.";
            savedAddRemoveContainer.classList.add(
              "add-remove-container--remove"
            );
          } else {
            savedSiteStatus.innerHTML = "Not saved.";
            savedAddRemoveContainer.classList.remove(
              "add-remove-container--remove"
            );
          }

          // Update excluded site status
          if (val.gsExcluded && val.gsExcluded.indexOf(hostname) > -1) {
            excludedSiteStatus.innerHTML = "Excluded.";
            excludedAddRemoveContainer.classList.add(
              "add-remove-container--remove"
            );
          } else {
            excludedSiteStatus.innerHTML = "Not excluded.";
            excludedAddRemoveContainer.classList.remove(
              "add-remove-container--remove"
            );
          }
        });
      }
    );
  });
}

function toggleTemporaryUngrayscale() {
  var checkbox = document.getElementById("temporary-ungrayscale-toggle");
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    if (checkbox.checked) {
      // Add tab to temporary ungrayscale list
      chrome.storage.local.get(["gsTempUngrayscale"], function (val) {
        let tempUngrayscale = val.gsTempUngrayscale || [];
        if (!tempUngrayscale.includes(tabs[0].id)) {
          tempUngrayscale.push(tabs[0].id);
          chrome.storage.local.set(
            { gsTempUngrayscale: tempUngrayscale },
            function () {
              chrome.tabs.sendMessage(tabs[0].id, { type: "turnOffGray" });
              turnIconOff();
            }
          );
        }
      });
    } else {
      // Remove tab from temporary ungrayscale list
      chrome.storage.local.get(["gsTempUngrayscale"], function (val) {
        let tempUngrayscale = val.gsTempUngrayscale || [];
        const index = tempUngrayscale.indexOf(tabs[0].id);
        if (index > -1) {
          tempUngrayscale.splice(index, 1);
          chrome.storage.local.set(
            { gsTempUngrayscale: tempUngrayscale },
            function () {
              // Reapply grayscale based on other settings
              chrome.storage.sync.get(
                ["gsAll", "gsExcluded", "gsSites", "gsTabs"],
                function (val) {
                  const hostname = getDomainFromTabs(tabs);
                  if (val.gsSites && val.gsSites.indexOf(hostname) > -1) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "turnOnGray" });
                    turnIconOn();
                  } else if (
                    val.gsTabs &&
                    val.gsTabs.indexOf(tabs[0].id) > -1
                  ) {
                    if (
                      !val.gsExcluded ||
                      val.gsExcluded.indexOf(hostname) === -1
                    ) {
                      chrome.tabs.sendMessage(tabs[0].id, {
                        type: "turnOnGray",
                      });
                      turnIconOn();
                    }
                  } else if (val.gsAll) {
                    if (
                      !val.gsExcluded ||
                      val.gsExcluded.indexOf(hostname) === -1
                    ) {
                      chrome.tabs.sendMessage(tabs[0].id, {
                        type: "turnOnGray",
                      });
                      turnIconOn();
                    }
                  }
                }
              );
            }
          );
        }
      });
    }
  });
}

// Call onLoad to initialize everything
onLoad();
