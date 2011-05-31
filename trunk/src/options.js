
var SELECTED_TAB_CLASS_NAME = 'selected';
var DETECTORS = [
  'BT9005',
  'BT9006',
  'BX1030',
  'BX8037',
  'BX9008',
  'HA8001',
  'HE1003',
  'HF3005',
  'HF3013',
  'HF9009',
  'HG8001',
  'HO8001',
  'HY1005',
  'RD1002',
  'RD1014',
  'RD8001',
  'RE1012',
  'RE1013',
  'RE1020',
  'RE8014',
  'RE8015',
  'RM8002',
  'RS8010',
  'RT8003',
  'RT3002',
  'RT3005',
  'RV1001',
  'RX1008',
  'RX3011',
  'RX8004',
  'RX8015',
  'RX8017',
  'SD9001',
  'SD9002',
  'SD9005',
  'SD9008',
  'SD9010',
  'SD9012',
  'SD9025',
  'SD9030'
];

var backgroundPage = chrome.extension.getBackgroundPage();

var shareUrl = 'https://chrome.google.com/webstore/detail/' +
        'fcillahbnhlpombgccogflhmgocfifma?hl=' + backgroundPage.getLocale();

/**
 * Share on Weibo/Tencent/Twitter open api.
 * Reference URL:
 * Weibo.com: http://open.t.sina.com.cn/sharebutton
 * t.qq.com: http://open.t.qq.com/apps/share/explain.php
 * Twitter.com: http://dev.twitter.com/pages/tweet_button
 */
function shareOnWeibo(element, title) {
  // The character '#' in the title of www.weibo.com website is illegal.
  // We should convert it to '%23'.
  element.innerHTML =
      '<a href="http://v.t.sina.com.cn/share/share.php?title=' +
      title.replace(/#/g, '%23') + '&url=' +  shareUrl +
      '&content=utf-8&appkey=" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnWeibo') +'</a>';
}

function shareOnTencent(element, title) {
  // The character '#' in the title of t.qq.com website is illegal.
  // We should replace it to empty string.
  element.innerHTML =
      '<a href="http://v.t.qq.com/share/share.php?url=' +
      shareUrl + '&appkey=&site=' + shareUrl + '&title=' +
      encodeURI(title.replace(/#/g, '')) + '" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnTencent') +'</a>';
}

function shareOnTwitter(element, title) {
  // The character '#' in the title of www.twitter.com website is illegal.
  // We should replace it to empty string.
  element.innerHTML =
      '<a href="http://www.twitter.com/share?url=' + shareUrl +
      '&text=' + title.replace(/#/g, '') + '" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnTwitter') + '</a>';
}

/**
 * Selected Detector process.
 */
function getDetectorCheckboxs() {
  return document.querySelectorAll('#optionPage > ul input[type=checkbox]');
}

function getSelectedDetectors() {
  var selectedDetectors = [];
  for(var i = 0, c = detectorCheckBoxs.length; i < c; ++i) {
    var detectorCheckBox = detectorCheckBoxs[i];
    if (detectorCheckBox.checked)
      selectedDetectors.push(detectorCheckBox.value)
  }
  return selectedDetectors;
}

function setSelectedDetecotrs(selectedDetectors) {
  for(var i = 0, c = selectedDetectors.length; i < c; ++i) {
    document.querySelector('#optionPage > ul input[type=checkbox][value=' +
        selectedDetectors[i] +']').checked = true;
  }
}

function saveDetectorOptions() {
  window.localStorage.setItem(backgroundPage.CHROME_COMP_SELECTED_DETECTORS,
      getSelectedDetectors());
}

/**
 * UI process - View initialization.
 */
function createDetectorOption(element) {
  var html = [];
  for(var i = 0, c = DETECTORS.length; i < c; ++i) {
    var detectorId = DETECTORS[i];
    html.push('<li><label><input type="checkbox" value="' + detectorId +
        '" />' + detectorId + '${' + detectorId + '}</label></li>');
  }
  element.innerHTML = html.join('');
}

function initDetectorSelectedCheckBox() {
  var selectedDetectors = backgroundPage.getDetectorOptions();
  if (selectedDetectors == undefined) {
    // Load data fail.
    onSelectAll();
  } else if (!selectedDetectors) {
    // Load data is null or empyt string.
    return;
  } else {
    // Load data success.
    selectedDetectors = selectedDetectors.split(',');
    setSelectedDetecotrs(selectedDetectors);
  }
}

function getTemplateData() {
  var VIEW_RESOURCE_IDS = [
    'extensionName',
    'opt_about',
    'opt_aboutFeedback',
    'opt_aboutReference',
    'opt_base',
    'opt_detectors',
    'opt_email',
    'opt_invertSelection',
    'opt_selectAll',
    'opt_selectNone',
    'opt_title'
  ];
  var data = getMessages(VIEW_RESOURCE_IDS.concat(DETECTORS));
  data['opt_support'] = chrome.i18n.getMessage('opt_support',
        ['<a href="https://chrome.google.com/webstore/detail/' +
        'fcillahbnhlpombgccogflhmgocfifma?hl=zh-CN" target="_blank">','</a>']);
  return data;
}

/**
 * UI Event process - tabstrip event.
 */
function getTabElementMap() {
  var tabElementMap = {
    tabList: [],
    selected: {tab: null, page: null}
  };
  var tabs = document.querySelectorAll('#tabstrip > span');
  var pages = document.querySelectorAll('#content > div');
  for (var i = 0, c = tabs.length; i < c; ++i) {
    if (tabs[i].className == SELECTED_TAB_CLASS_NAME) {
      tabElementMap.selected.tab = tabs[i];
      tabElementMap.selected.page = pages[i];
    }
    tabElementMap.tabList.push({
      tab: tabs[i],
      page: pages[i],
    });
  }
  return tabElementMap;
}

function addTabEvent() {
  var tabElementMap = getTabElementMap();
  var tabList = tabElementMap.tabList;
  for (var i = 0, c = tabList.length; i < c; ++i) {
    var tabMap = tabList[i];
    tabMap.tab._index = i;
    tabMap.tab.addEventListener('click', function() {
      var selected = tabElementMap.selected;
      if (this == selected.tab)
        return;
      selected.tab.className = '';
      selected.page.className = '';
      selected.tab = this;
      selected.page = tabList[this._index].page;;
      selected.tab.className = SELECTED_TAB_CLASS_NAME;
      selected.page.className = SELECTED_TAB_CLASS_NAME;
    }, false);
  }
}

/**
 * UI Event process - detector select buttons event.
 */
function addDetectorSelectButtonEvent(){
  var selectAll = document.querySelectorAll('.optSelectAll');
  var selectNone = document.querySelectorAll('.optSelectNone');
  var invertSeletion = document.querySelectorAll('.optInvertSelection');
  selectAll[0].addEventListener('click', onSelectAll, false);
  selectAll[1].addEventListener('click', onSelectAll, false);
  selectNone[0].addEventListener('click', onSelectNone, false);
  selectNone[1].addEventListener('click', onSelectNone, false);
  invertSeletion[0].addEventListener('click', onInvertSelection, false);
  invertSeletion[1].addEventListener('click', onInvertSelection, false);
}

var detectorCheckBoxs = [];

function onSelectAll() {
  for(var i = 0, c = detectorCheckBoxs.length; i < c; ++i) {
    detectorCheckBoxs[i].checked = true;
  }
  onCheckboxChange();
}

function onSelectNone() {
  for(var i = 0, c = detectorCheckBoxs.length; i < c; ++i) {
    detectorCheckBoxs[i].checked = false;
  }
  onCheckboxChange();
}

function onInvertSelection() {
  for(var i = 0, c = detectorCheckBoxs.length; i < c; ++i) {
    detectorCheckBoxs[i].checked = !detectorCheckBoxs[i].checked;
  }
  onCheckboxChange();
}

function onCheckboxChange() {
  saveDetectorOptions();
}

/**
 * UI Event process - detector checkboxs event.
 */
function addDetectorCheckboxEvent() {
  for(var i = 0, c = detectorCheckBoxs.length; i < c; ++i) {
    detectorCheckBoxs[i].addEventListener('change', onCheckboxChange, false);
  }
}

/**
 * UI Event process - page DOM content loaded event handle.
 */
function onDOMContentLoaded() {
  createDetectorOption(document.querySelector('#optionPage > ul'));
  // HTMLView i18n
  bulidHTMLView(getTemplateData(), document.body);
  detectorCheckBoxs = getDetectorCheckboxs();

  initDetectorSelectedCheckBox();

  // Add UI Event
  addTabEvent();
  addDetectorSelectButtonEvent();
  addDetectorCheckboxEvent();

  // set share button
  var shareTitle = chrome.i18n.getMessage('opt_shareTitle');
  shareOnWeibo($('shareOnWeibo'), shareTitle);
  shareOnTencent($('shareOnTencent'), shareTitle);
  shareOnTwitter($('shareOnTwitter'), shareTitle);
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
