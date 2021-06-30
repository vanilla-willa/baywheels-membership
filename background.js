function showPopup(tab) {
    chrome.tabs.sendMessage(tab.id, { action: "show popup" });
};

chrome.pageAction.onClicked.addListener(showPopup);

// need to setIcon

var regex = RegExp(/https:\/\/account\.baywheels\.com\/ride-history/)

const enableExtension = (tab) => {
	if (tab.url.match(regex)) {
		chrome.pageAction.show(tab.id);
		showPopup(tab);
	}
	else {
		chrome.pageAction.hide(tab.id);
		chrome.tabs.sendMessage(tab.id, { action: "remove popup" });
	}
}

// When user changes between tabs in same window
chrome.tabs.onActivated.addListener( async ({tabId}) => {
    await chrome.tabs.query({'active': true, 'currentWindow': true}, (tabs) => {
		setTimeout(() => {
			console.log("inside onActivated: ", tabs);
			console.log(tabs[0])
			enableExtension(tabs[0]), 1000});
	});
});

// when user updates a specific tab (ie. navigates to diff url)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab)  {
    if (tab.status === 'complete') {
		console.log("tab in onUpdated: ", JSON.stringify(tab))
		enableExtension(tab);
	}
})

// when user navigates to a different window
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId > 0) {
        chrome.tabs.getSelected(windowId, (tab) => enableExtension(tab));
    }
})