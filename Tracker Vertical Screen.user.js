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

/**
 * Generate a button to copy text ot clipboard.
 * @param {String} clipText the text to clip
 * @param {String} buttonText optional button text
 * @return {HTMLElement}
 */
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

/**
 * Add localhost links to the project shortcuts section.
 */
const addLocalhostLinks = function() {
    const issueLink = document.querySelector(`.aui-nav-breadcrumbs .issue-link`);
    const issueKey = issueLink?.dataset?.issueKey;
    const target = document.querySelector(`.project-shortcuts-list`);
    if (!issueKey || !target) {
        return;
    }
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
};

/**
 * Add copy buttons to the issue fields.
 */
const addFieldsClipboardButtons = function() {
    // Add some clipboard buttons depending on the page.
    const propertylist = document.querySelector(`#customfield-tabs .property-list`);
    if (!propertylist) {
        return;
    }
    const properties = propertylist.querySelectorAll(`li.item .value`);
    properties.forEach(item => {
        // Add clipboard button.
        let clipButton = getClipboardButton(item.textContent);
        clipButton.style.position = "absolute";
        clipButton.style.left = "-2.5rem";
        item.parentNode.prepend(clipButton);
    });
};

/**
 * Add CLR command copy button to page.
 */
const addCLRClipboardButtons = function() {
    const gitInfo = {
        repo: document.getElementById(`customfield_10100-val`)?.textContent,
        branch: document.getElementById(`customfield_10111-val`)?.textContent
    };
    if (!gitInfo.repo || !gitInfo.branch) {
        return;
    }
    // Generate gg clr command.
    const jiraTools = document.getElementById('stalker');
    const clipButton = getClipboardButton(`gg clr ${gitInfo.repo} ${gitInfo.branch}`, 'CLR command');
    clipButton.style.position = "absolute";
    clipButton.style.right = "2.5rem";
    clipButton.style.bottom = "4rem";
    jiraTools?.prepend(clipButton);
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

    addLocalhostLinks();
    addFieldsClipboardButtons();
    addCLRClipboardButtons();
})();
