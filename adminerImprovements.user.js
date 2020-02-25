// ==UserScript==
// @name        adminerImprovements
// @namespace   Adminer
// @description Visualización de Adminer
// @include     http://localhost/adminer/*
// @version     1
// @grant       none
// @require     http://code.jquery.com/jquery-latest.min.js
// @license MIT
// ==/UserScript==

function vistaOn(){
  $('#menu').toggle();
  if ($('#menu').css('display') == 'none'){
    $('#content').css('marginLeft', '1em');
    $('a.vista-adminer').text('Vista | On');
    $('pre.sqlarea').css('display', 'none');
    $('pre#sql-1').css('display', 'none');
  }else{
    $('#content').css('marginLeft', '21.5em');
    $('a.vista-adminer').text('Vista | Off');
    $('pre.sqlarea').css('display', 'block');
    $('pre#sql-1').css('display', 'block');
  }
}

function adaptMenu(){
  var nuheight = window.innerHeight - $('#menu').offset().top -30;
  $('#menu').css({
      'height': nuheight+'px',
      'overflow-y': 'scroll',
      'overflow-x': 'visible',
      'position': 'fixed',
      'background-color': 'white',
      'margin': 0
    });
  $(document).scroll(function(){
      console.log($('#menu').position().top +' '+ $(window).scrollTop());
      if ($('#menu').position().top < $(window).scrollTop()) {
          $('#menu').css({'top': 0});
      } else {
          $('#menu').css({'top': '2em'});
      }
  });
}

function addFilter(){
  var $searchBox = $('<p id="search-box" />');
  $('#tables').before($searchBox);
  $searchBox.append($('<input type="text" id="search-input" style="width:120px" />'));
  $searchBox.append($('<input type="button" id="filter-button" value="Filter" />'));
  $searchBox.append($('<input type="button" id="all-button" value="Clean" />'));
  // Filter events.
  $('body').on('keypress', '#search-input',  function (e) {
    if(e.which === 13){
      locationToLink("#tables li.keyselect a.structure");
    }
  });
  $('body').on('keydown', '#search-input',  function (e) {
    if (e.which == 27) { // Esc
      resetFilter();
    }
    var currenttable = $("#tables li.keyselect");
    if (e.which == 38) { // Up
      var prevtable = currenttable.prevAll('li:visible:first');
      if (prevtable.is(":visible")){
          currenttable.removeClass('keyselect');
          prevtable.addClass('keyselect');
      }
      return false;
    }
    if (e.which == 40) { // Down
      var nexttable = currenttable.nextAll('li:visible:first');
      if (nexttable.is(":visible")){
          currenttable.removeClass('keyselect')
          nexttable.addClass('keyselect');
      }
      return false;
    }
    if (e.which > 96 && e.which < 100) { // Numpad 1, 2, 3, 4
        var n = e.which - 96;
        locationToLink("#content p.links a:nth-child(" + n + ")");
    }
    if (e.which == 36) { // home
        currenttable.removeClass('keyselect');
        $("#tables li:visible:first").addClass('keyselect');
    }
    if (e.which == 35) { // end
        currenttable.removeClass('keyselect');
        $("#tables li:visible:last").addClass('keyselect');
    }
    $('#filter-button').click();
  });
  $('body').on('click', '#filter-button', filterTables);
  $('body').on('click', '#all-button', resetFilter);
  // Set current filter if any
  var currentFilter = storedFilter();
  if (currentFilter){
      $searchInputVal = $('#search-input').val(currentFilter);
      $('#filter-button').click();
  }
}

function locationToLink(selector){
    var Href = $(selector).attr('href');
    if (Href != undefined){
        document.location = Href;
    }
}

function filterTables(){
    $searchInputVal = $('#search-input').val();
    storedFilter($searchInputVal);
    $aTags = $('a.select', $("#tables"));
    $aTags
      .each(function() {
        Href = $(this).attr('href');
        IndexOfSelect = Href.indexOf("select=");
        IndexOfSelectPlus = IndexOfSelect + 6;
        if (Href.indexOf($searchInputVal, IndexOfSelectPlus) >= 0) {
            $(this).parent('li').show(); // select
        } else {
            $(this).parent('li').hide(); // select
        }
      }).promise().done( function() {
        if ($("#tables li.keyselect:visible:first").length == 0) {
            $("#tables li.keyselect").removeClass('keyselect');
            $("#tables li:visible:first").addClass('keyselect');
        }
      });
}

function resetFilter(){
    $('#search-input').val('');
    $('#filter-button').click();
}

function storedFilter (newval){
    var nuid = "adminerfilter_"+$('select[name=db]').children("option:selected").val();
    if (newval != undefined) {
        localStorage.setItem(nuid, $searchInputVal);
    }
    return localStorage.getItem(nuid);
}


$(document).ready(function(){
  var tablaClone = $('pre#sql-1 + table.nowrap').clone();
  $('pre#sql-1 + table.nowrap').remove();
  $('form#form fieldset').after(tablaClone);

  // Button to show/hide the tables list.
  $('#lang').append('<a class="vista-adminer" href="#">Vista | On</a>');
  $('textarea.sqlarea').css({
    'display':'block'
  });
  $('a.vista-adminer').css({
    'margin-right': '1em'
  });

  // Add some styling.
  $("<style type='text/css'> .keyselect{ text-decoration: underline;} </style>").appendTo("head");

  // Simplify table list.
  $('#menu li a.select')
      .text("[S]")
      .css({'color': 'green'});

  // Remove Moodle prefix from table list.
  $('#menu li a.structure').each(function() {
    var text = $(this).text();
    $(this).text(text.replace('mdl_', ''));
  });

  // Add filter form
  addFilter();
  if ($(document.activeElement).prop("tagName") == 'BODY') {
      $('#search-input').focus();
  }

  // Add scroll to table list.
  adaptMenu();
  $( window ).resize(adaptMenu);

  $('a.vista-adminer').on('click', function(){
    vistaOn();
  })
});