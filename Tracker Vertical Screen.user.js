// ==UserScript==
// @name         Tracker Vertical Screen
// @namespace    https://tracker.moodle.org/
// @version      0.1
// @description  Make Modole tracker vertical screen friendly
// @author       You
// @match        https://tracker.moodle.org/*
// @icon         https://www.google.com/s2/favicons?domain=moodle.org
// @grant        none
// ==/UserScript==

const getClipboardButton = function(clipText, buttonText) {
    let clipButton = document.createElement("button");
    clipButton.innerText = buttonText ?? "CP";
    clipButton.style.borderWidth = 0;
    clipButton.style.transition = "all .2s";
    clipButton.style.border = "1px solid green";
    clipButton.style.borderRadius = "5px";
    clipButton.addEventListener('click', function (event) {
        event.preventDefault();
        const clip = navigator.clipboard.writeText(clipText.replace(/(\r\n|\n|\r)/gm,""));
        clip.then(
            () => {
                clipButton.style.backgroundColor = "green";
            },
            () => {
                clipButton.style.backgroundColor = "red";
            },
        );
        clip.finally(
            () => {
                setTimeout(function(){
                    clipButton.style.backgroundColor = "";
                }, 2000);
            }
        );
    });
    return clipButton;
};

(function() {
    'use strict';

    // Add some custom classes.
    var style = document.createElement('style');
    style.innerHTML = `.minmenow { width: 20px!important; background-color: lightblue;}`;
    document.head.appendChild(style);

    // Add double click events.
    const lateralpanel = document.getElementById(`viewissuesidebar`);
    lateralpanel.addEventListener('dblclick', function (e) {
        lateralpanel.classList.toggle('minmenow');
    });

    // Add localhost and integration links.
    const issueLink = document.querySelector(`.aui-nav-breadcrumbs .issue-link`);
    const issueKey = issueLink?.dataset?.issueKey;
    const target = document.querySelector(`.project-shortcuts-list`);
    if (issueKey && target) {
        // Localhost.
        let localhostItem = document.createElement("li")
        localhostItem.classList.add('project-shortcut');
        localhostItem.innerHTML = `<a href="http://localhost/m/${issueKey}">Localhost</a>`;
        target.append(localhostItem);
        // Integraiton (for CLR).
        let integrationItem = document.createElement("li")
        integrationItem.classList.add('project-shortcut');
        integrationItem.innerHTML = `<a href="http://localhost/m/integration">Integration</a>`;
        target.append(integrationItem);
    }

    // Some fields are important to us.
    const repoFieldId = `customfield_10100-val`;
    const branchFieldId = `customfield_10111-val`;
    const gitInfo = {};

    // Add some clipboard buttons depending on the page.
    const propertylist = document.querySelector(`#customfield-tabs .property-list`);
    if (propertylist) {
        const properties = propertylist.querySelectorAll(`li.item .value`);
        properties.forEach(item => {
            // Add clipboard button.
            let clipButton = getClipboardButton(item.textContent);
            clipButton.style.position = "absolute";
            clipButton.style.left = "-2.5rem";
            item.parentNode.prepend(clipButton);
            // Check f it is a git information field.
            if (item.id === repoFieldId) {
                gitInfo.repo = item.textContent;
            }
            if (item.id === branchFieldId) {
                gitInfo.branch = item.textContent;
            }
        });
    }

    // Generate an extra repo and branch button if possible.
    if (gitInfo.repo && gitInfo.branch) {
        const jiraTools = document.getElementById('stalker');
        const clipButton = getClipboardButton(`gg clr ${gitInfo.repo} ${gitInfo.branch}`, 'CLR command');
        clipButton.style.position = "absolute";
        clipButton.style.right = "2.5rem";
        clipButton.style.bottom = "4rem";
        jiraTools.prepend(clipButton);
    }
})();
