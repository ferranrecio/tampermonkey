// ==UserScript==
// @name        GmailMoodleTrackerintegration
// @namespace   https://mail.google.com/mail/*
// @include     https://mail.google.com/mail/*
// @version     1
// @grant       GM_xmlhttpRequest
// @connect     tracker.moodle.org
// @author       Ferran Recio
// @license MIT
// ==/UserScript==

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

window.addEventListener('load', function () {
  console.log("TRACKER INFO");
	setTimeout(function() {
        console.log("INIT TRACKER INFO");
        trackerinfo.ini();
	},5000);
}, false);

let trackerinfo = {};

trackerinfo._ini = function() {
    // Add error message.
    var element = document.createElement('button');
    element.style.position = 'absolute';
    element.style.bottom = '40px';
    element.style.left = '20px';
    element.innerHTML = 'Scan MDLs';
    element.addEventListener("click", () => {
        trackerinfo.scan();
    });
    document.body.appendChild(element);
};

trackerinfo.ini = debounce(trackerinfo._ini, 2000);

trackerinfo._error = function() {
    // Add scan button.
    var element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.bottom = '75px';
    element.style.left = '20px';
    element.style.width = '200px';
    element.style.backgroundColor = 'lightyellow';
    element.style.padding = '1em';
    element.innerHTML = 'Cannot connect the tracker. Please <a href="https://tracker.moodle.org/login.jsp" target="_blank">login</a> before scan';
    document.body.appendChild(element);

    setTimeout(function() {
        element.parentNode.removeChild(element);
	},10000);
};

trackerinfo.error = debounce(trackerinfo._error, 508);

trackerinfo.scan = function() {
    document.querySelectorAll('tr').forEach(item => {
        let mdlcode = trackerinfo.getMDL(item);
        if (mdlcode === null) {
            return;
        }
        // console.log(mdlcode);
        trackerinfo.putBadge(item, mdlcode);

    });
};

trackerinfo.getMDL = function(item) {
    let content = item.textContent;
    // Check for MDL codes.
    const regexp = /MDL-\d+/g;

    const matches = [...content.matchAll(regexp)];

    if (matches.length == 0) {
        return null;
    }

    return matches.pop().pop();
}

trackerinfo.putBadge = async function(item, mdlcode) {
    // Get tracker info.
    let info = await trackerinfo.getMDLinfo(mdlcode);
    // Put the tracke info.
    try {
        const badge = await trackerinfo.getBadge(info);
        // console.log(info, badge);
        item.setAttribute('title', badge.content);
        item.style.borderLeftColor = badge.color;
        item.style.borderLeftStyle = badge.style;
        item.style.borderLeftWidth = '5px';
    } catch(error) {
        trackerinfo.error(error);
    }
}

trackerinfo.getMDLinfo = async function(mdlcode) {
    let url = "https://tracker.moodle.org/rest/api/latest/issue/" + mdlcode + "?fields=summary,status,labels";
    try {
        return trackerinfo.makeRequest('GET', url);
        //console.log(info);
    } catch(error) {
        console.log(error);
        trackerinfo.error();
    }
    return false;
}

trackerinfo.makeRequest = function (method, url, data) {

    return new Promise(function (resolve, reject) {

        const request = {
            method: method,
            url: url,
            onload: function(xhr) {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        };

        if (data !== undefined) {
            request.data = JSON.stringify(data)
        }

        GM_xmlhttpRequest(request);
    });
}

trackerinfo.getBadge = function(info) {
    let content = info.key + ' ';
    // Check triaged.
    const labels = info?.fields?.labels ?? [];
    const istriaged = labels.includes('triaged');
    content += (istriaged) ? 'TRIAGED: YES! ' : 'TRIAGED: no ';
    // Cehck status.
    const status = info?.fields?.status?.name;
    content += 'STATUS: ' + status;
    // Set border color and style.
    let style = (istriaged) ? 'dotted': 'solid';
    let color = 'lightsteelblue';
    switch (status) {
        case 'Closed':
            color = 'red';
            break;
        case 'Open':
            color = 'goldenrod';
            break;
    }

    return {
        key: info.key,
        content,
        istriaged,
        status,
        style,
        color,
    };
}


