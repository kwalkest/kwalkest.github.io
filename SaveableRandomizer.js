// The Garfield Saveable Randomizer
// by Kevin Walker

// global variables to make accessing the panel cells and checkbox cells easier
var tablePanel = new Array("cellDNE", "cell1", "cell2", "cell3");
var checkLock = new Array("lockboxDNE", "lockbox1", "lockbox2", "lockbox3");
var currentPanels = new Array();
var originalPlace = new Array();
var saveSearch = new String();

// set all panels that are specified in location.search
function restore()
{
	var panelSaved;

	// don't restore() if there's no location.search
	if (location.search == "" || location.search == "?") {
		return;
	} else {
		panelSaved = parseGetVars();
	}
	
	for (var str in panelSaved) {
				
		// the saved panel name must be panel_M, where M is 1, 2, or 3; ignore it otherwise
		if (str.length == 7 && str.indexOf("panel_") == 0 && str.charAt(6) >= 1 && str.charAt(6) <= 3) {
			targetPanel = str.charAt(6);
		} else {
			continue
		}
		
		// the saved date must be formatted yymmdd_N, where N is 1, 2, or 3; ignore it otherwise
		if ((panelSaved[str].length == 8) && !(isNaN(panelSaved[str].substr(0,6))) && (panelSaved[str].charAt(6) == "_") && (panelSaved[str].charAt(7) >= 1) && (panelSaved[str].charAt(7) <= 3)) {
			originalPlace[targetPanel] = panelSaved[str].charAt(7);
		} else {
			continue;
		}
		
		// place the vetted date from str into currentPanels[panel_targetPanel] and then load it
		currentPanels["panel_"+targetPanel] = panelSaved[str];
		loadPanel(currentPanels["panel_"+targetPanel], targetPanel);
		
		// lock that panel and enable the email functions
		document.getElementById(checkLock[targetPanel]).checked=true;
	}
}

// saved Random Garfields are read through this parsing function
// which is borrowed from a post #5 on the following forum topic
// by the user "mordred": http://www.codingforums.com/showthread.php?s=&threadid=2217
function parseGetVars()
{
	var getVars = location.search.substr(1).split("&");
	var returnVars = new Array();
	
	for(i=0; i < getVars.length; i++) {
		var newVar = getVars[i].split("=");
		returnVars[unescape(newVar[0])] = unescape(newVar[1]);
	}
	
	return returnVars;
}

// translates the string "yymmdd_N" into an original panel N and places it into the target panel
function loadPanel(dateStr, toPanel)
{
	var year;
	var horizontalOffset;
	var verticalOffset;
	var panelToUpdate;
	var fromPanel = dateStr.charAt(7);
	
	// tweak the exact locations of the different panels
	if (fromPanel == 1) {
		horizontalOffset = -3;
		verticalOffset = -3;
	} else if (fromPanel == 2) {
		horizontalOffset =  -201;
		verticalOffset = 0;
	} else {
		horizontalOffset = -399;
		verticalOffset = -2;
	}
	
	// turn the 2-digit year into a 4-digit one
	if (dateStr.substr(0,2) >= 78) {
		year = "19".concat(dateStr.substr(0,2));
	} else {
		year = "20".concat(dateStr.substr(0,2));
	}
	
	imgurl = "http://images.ucomics.com/comics/ga/".concat(year, "/ga", dateStr.substr(0,6), ".gif");
	panelToUpdate = document.getElementById(tablePanel[toPanel]);
	panelToUpdate.background = imgurl;
	panelToUpdate.style.background = "url(" + imgurl + ") " + horizontalOffset + "px " + verticalOffset + "px";
}

// enable and disable buttons according to whether they can do anything
function updateInterface()
{
	saveSearch = "";
	
	// if any panel is locked, enable unlockAll, saveLocked, and the email/address stuff
	if (document.getElementById(checkLock[1]).checked || document.getElementById(checkLock[2]).checked || document.getElementById(checkLock[3]).checked) {
		document.getElementById("saveLocked").disabled = false;
		document.getElementById("unlockAll").disabled = false;
		document.getElementById("addresses").disabled = false;
		document.getElementById("sendButton").disabled = false;
	// otherwise all panels are unlocked, so disable them
	} else {
		document.getElementById("saveLocked").disabled = true;
		document.getElementById("unlockAll").disabled = true;
		document.getElementById("addresses").disabled = true;
		document.getElementById("sendButton").disabled = true;
	}
	
	// if any panel is unlocked, enable randomize and lockAll
	if (!(document.getElementById(checkLock[1]).checked) || !(document.getElementById(checkLock[2]).checked) || !(document.getElementById(checkLock[3]).checked)) {
		document.getElementById("randomize").disabled = false;
		document.getElementById("lockAll").disabled = false;
	// otherwise all panels are locked, so disable them; also change the search
	} else {
		document.getElementById("randomize").disabled = true;
		document.getElementById("lockAll").disabled = true;
	}
	
	for (i = 1; i <= 3; i++) {
		if (document.getElementById(checkLock[i]).checked) {
			saveSearch = saveSearch + "&panel_"+i+"=" + currentPanels["panel_"+i];
			document.getElementById("currentPanel"+i).value = "panel_"+i+"=" + currentPanels["panel_"+i];
		} else {
			document.getElementById("currentPanel"+i).value = "";
		}
	}
	
	if (saveSearch.indexOf("panel_") != -1) {
		saveSearch = "?" + saveSearch.substr(1);
	}
}

// load new panels for unlocked slots
function randomizeUnlockedPanels()
{
	var rightNow = new Date();
	var horizontalOffset;
	
	// cycle through unlocked panels only
	for (i = 1; i <= 3; i++) {
		
		// place a locked panel into the search, otherwise ignoring it
		if (document.getElementById(checkLock[i]).checked) {
			
			continue;
		}
		
		// choose a date
		do {
			year = 1978 + Math.floor(Math.random() * (rightNow.getFullYear() + 1 - 1978));
			month = Math.floor(Math.random() * 12 + 1);
			day = Math.floor(Math.random() * 30 + 1);

				// re-choose the date to make sure that it is not:
				// 1) before Garfield started (on 19 June 1978),
				// 2) in the future,
				// 3) on a Sunday,
				// 4) the 31st on a 30-day month,
				// 5) the 30th or 31st in February, and
				// 6) the 29th unless it's a leap year
		} while ((year == 1978 && (month < 6 || (month == 6 && day < 19)))
				|| (year == rightNow.getFullYear() && (month > rightNow.getMonth() || (month == rightNow.getMonth() && day > rightNow.getDay())))
				|| ((new Date(fmt(month) + "/" + fmt(day) + "/" + fmt(year))).getDay() == 0)
				|| (day > 30 && (month == 4 || month == 6 || month == 9 || month == 11))
				|| (month == 2 && day > 29)
				|| (month == 2 && day == 29 && ((year%4 != 0 && year%4 == 100) || year%400 != 0)));
				
		// choose one of the three panels in the strip, counted them as 0, 1, and 2
		originalPlace[i] = Math.floor(Math.random() * 3) + 1;
				
		currentPanels["panel_"+i] = "".concat(fmt(year%100), fmt(month), fmt(day), "_", originalPlace[i]);
		
		loadPanel(currentPanels["panel_"+i], i);
	}
}

// format year, day, or month to make sure they're at least two digits
function fmt(n)
{
	if (n < 10) {
		return "0" + n;
	}
	return n;
}

// place locked panels into location.search
function saveToSearch()
{
	//alert("location.search is " + location.search + "\nsaveSearch is " + saveSearch);
	location.search = saveSearch;
}

// unlock all locked checkboxes
function unlockBoxes()
{
	for (i = 1; i <= 3; i++) {
		document.getElementById(checkLock[i]).checked=false;
	}
	updateInterface();
}

// lock all unlocked checkboxes
function lockBoxes()
{
	for (i = 1; i <= 3; i++) {
		document.getElementById(checkLock[i]).checked=true;
	}
	updateInterface();
}

function emailLocked()
{
	var mailRecipients = escape(document.getElementById("addresses").value);
	var mailSubject = escape("Randomized Garfield");
	var locationHere = (location.toString()).split("?")[0];
	var mailBody = escape("I hit the jackpot with an awesome new comic! You can see it here:\n"+locationHere+saveSearch+"\n\nSincerely Yrs.,\nMe");
	
	window.location="mailto:"+mailRecipients+"?subject="+mailSubject+"&body="+mailBody;
}
