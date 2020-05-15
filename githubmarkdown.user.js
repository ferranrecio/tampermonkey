// ==UserScript==
// @name         githubmarkdown
// @namespace    http://https://github.com/*
// @version      0.1
// @description  Add clipboard markdown link of the current selected code line at the bottom of the page.
// @author       Ferran Recio
// @match        https://github.com/*
// @require      http://code.jquery.com/jquery-latest.min.js
// @grant        none
// @license      MIT
// ==/UserScript==

function hashchanged(elem){
    clean_markdown_tools();

    var url = document.location;
    var line = elem.data('line-number');

    add_markdown_line_links(url, line, elem);

    add_markdown_file_links(url, line, elem);

    add_markdown_code_links(url, line, elem);
}

function add_markdown_code_links(url, line, elem) {
    // Try to parse the line if possible.
    var blobs = elem.siblings('.blob-code');
    if (blobs.length != 0) {
        blobs.each(function(index, value){
            var code = value.innerText.trim();
            if (code != "") {
                var links = parse_code_markdown(code);
                for(var i=0; i<links.length; i++){
                    add_markdown_button(links[i], links[i], url);
                }
            }
        });
    } else {
        console.log("Sorry, no line detected");
    }
}

function parse_code_markdown(code) {
    let links = [];
    // Find method definition
    let regex = [
        /function (\w+)/g,
        /class (\w+)/g,
        /(\$\w+) =/g,
        /(\@\w+)/g,
    ];
    for(var i=0; i<regex.length; i++) {
        let found = regex[i].exec(code);
        if (found != null && found.length == 2) {
            links.push(found[1]);
        }
    }
    return links;
}

function add_markdown_line_links(url, line, elem) {
    add_markdown_button("here", "here", url);
    add_markdown_button("#"+line, "#"+line, url);
}

function add_markdown_file_links(url, line, elem) {
    var filename = '';
    var parent = elem.parents('.file').first();
    if (parent.length != 0) {
        // Try to get the filename in diff view.
        var filepath = parent.find('.file-info clipboard-copy').first().val();
        if (filepath != undefined) {
            add_markdown_button("Path", filepath, url);
            add_markdown_button("Path #"+line, filepath+" #"+line, url);
        }
        var parts = filepath.split('/');
        filename = parts.pop() || parts.pop();
    } else {
        // Try to find final path from breadcrumb (need when view a single file)
        var finalelem = document.querySelector(".breadcrumb .final-path");
        if (finalelem) {
            filename = finalelem.innerHTML;
        }
    }
    if (filename != '') {
        add_markdown_button("File", filename, url);
        add_markdown_button("File #"+line, filename+" #"+line, url);
    } else {
        console.log("Sorry, no filename detected");
    }
}

function clean_markdown_tools() {
    var tools = document.getElementById('markdowntools');
    tools.innerHTML = "";
}

function create_markdown_tools() {
    // Generate general toolbox.
    var tools = document.createElement('div');
    tools.setAttribute('id', 'markdowntools');
    Object.assign(tools.style,{
        position:"fixed", bottom:"2em", left:"1em"
    });
    document.body.appendChild(tools);
}

function add_markdown_button(buttontext, linktext, url) {
    linktext = markdown_clean_string(linktext);
    var markdown = " ["+linktext+"|"+url+"]";
    var clips = get_clipboard_button();

    var button = document.createElement('span');
    button.classList.add('text-gray');
    Object.assign(button.style,{
        backgroundColor:"#fff", border:"1px solid #ccc",
        padding:".2em .3em", cursos:"alias", margin:"2px"
    });
    clips.setAttribute('value', markdown);
    button.innerHTML = buttontext+" "+clips.outerHTML;

    var tools = document.getElementById('markdowntools');
    tools.appendChild(button);
}

function markdown_clean_string(linktext) {
    const regex = /(\[|\])/gi;
    return linktext.replace(regex, '\\$1');
}

function get_clipboard_button () {
    // Find the first clipboard element if any.
    var clipelem = document.querySelector(".file-info clipboard-copy");
    if (clipelem) {
        return clipelem.cloneNode(true);
    }
    var clips = document.createElement('clipboard-copy');
    clips.innerHTML = '[&#10175;]';
    clips.classList.add('link-hover-blue');
    Object.assign(clips.style,{
        cursor:"pointer"
    });
    clips.setAttribute('data-copy-feedback', "Copied!");
    return clips
}

function init_markdown() {
    var rf = document.getElementById('refreshmarkdown');
    if (rf) {
        rf.innerHTML = '...';
        setTimeout(function() { rf.innerHTML = '[Refresh]'; }, 500);
    }
    $("body").on("click", "*[data-line-number]", function(e) {
        var elem = $(event.target);
        setTimeout(function() { hashchanged(elem); }, 250);
    });
}

(function() {
    'use strict';
    console.log("Init markdown script");
    create_markdown_tools();
    init_markdown();
})();
