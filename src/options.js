
var SHARE_URL = 'https://chrome.google.com/webstore/detail/' +
        'fcillahbnhlpombgccogflhmgocfifma';

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

/**
 * All the check boxes to determin which detectors are enabled.
 */
var detectorCheckboxs = [];

/**
 * Share on Weibo/Tencent/Twitter open api.
 * Reference URL:
 * weibo.com: http://open.t.sina.com.cn/sharebutton
 * t.qq.com: http://open.t.qq.com/apps/share/explain.php
 * twitter.com: http://dev.twitter.com/pages/tweet_button
 */
function shareOnWeibo(element, title) {
  // TODO: clarify this
  // The character '#' in the title of www.weibo.com website is illegal.
  // We should convert it to '%23'.
  element.innerHTML =
      '<a href="http://v.t.sina.com.cn/share/share.php?title=' +
      title.replace(/#/g, '%23') + '&url=' +  SHARE_URL +
      '&content=utf-8&appkey=" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnWeibo') +'</a>';
}

function shareOnTencent(element, title) {
  element.innerHTML =
      '<a href="http://v.t.qq.com/share/share.php?url=' +
      SHARE_URL + '&appkey=&site=' + SHARE_URL + '&title=' +
      encodeURI(title.replace(/#/g, '')) + '" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnTencent') +'</a>';
}

function shareOnTwitter(element, title) {
  element.innerHTML =
      '<a href="http://www.twitter.com/share?url=' + SHARE_URL +
      '&text=' + title.replace(/#/g, '') + '" target="_blank">' +
      chrome.i18n.getMessage('opt_shareOnTwitter') + '</a>';
}

function createDetectorCheckboxes() {
  var html = [];
  for (var i = 0, c = DETECTORS.length; i < c; ++i) {
    var id = DETECTORS[i];
    html.push('<li><input type="checkbox" value="' + id + '" />' + id +
        ': ${' + id + '}</li>');
  }
  $('detectors').innerHTML = html.join('\n');
}

function initDetectorCheckboxes() {
  var disabledDetectors = backgroundPage.getDisabledDetectors();
  for (var i = 0, c = detectorCheckboxs.length; i < c; ++i) {
    var checkbox = detectorCheckboxs[i];
    checkbox.checked = !(checkbox.value in disabledDetectors);
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
    'opt_support',
    'opt_title'
  ];
  // Append detector IDs.
  var ids = VIEW_RESOURCE_IDS.concat(DETECTORS);
  return getMessages(ids);
}

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
      selected.page = tabList[this._index].page;
      selected.tab.className = SELECTED_TAB_CLASS_NAME;
      selected.page.className = SELECTED_TAB_CLASS_NAME;
    }, false);
  }
}

function addDetectorSelectButtonEvent(){
  var selectAll = document.querySelectorAll('.optSelectAll');
  var selectNone = document.querySelectorAll('.optSelectNone');
  var invertSeletion = document.querySelectorAll('.optInvertSelection');
  // TODO: use getElementsByClassName and for loop
  selectAll[0].addEventListener('click', onDetectorsSelectAll, false);
  selectAll[1].addEventListener('click', onDetectorsSelectAll, false);
  selectNone[0].addEventListener('click', onDetectorsSelectNone, false);
  selectNone[1].addEventListener('click', onDetectorsSelectNone, false);
  invertSeletion[0].addEventListener('click', onDetectorsInvertSelection,
      false);
  invertSeletion[1].addEventListener('click', onDetectorsInvertSelection,
      false);
}

function addDetectorCheckboxEvent() {
  for (var i = 0, c = detectorCheckboxs.length; i < c; ++i) {
    detectorCheckboxs[i].addEventListener('change', onDetectorCheckboxChange,
        false);
  }
}

function onDetectorCheckboxChange() {
  saveDetectorOptions();
}

function saveDetectorOptions() {
  var disabledDetectors = {};
  for (var i = 0, c = detectorCheckboxs.length; i < c; ++i) {
    var checkbox = detectorCheckboxs[i];
    if (!checkbox.checked)
      disabledDetectors[checkbox.value] = true;
  }
  backgroundPage.setDisabledDetectors(disabledDetectors);
}

function onDetectorsSelectAll() {
  changeDetectorsSelection(true);
}

function onDetectorsSelectNone() {
  changeDetectorsSelection(false);
}

function changeDetectorsSelection(value) {
  for (var i = 0, c = detectorCheckboxs.length; i < c; ++i) {
    detectorCheckboxs[i].checked = value;
  }
  onDetectorCheckboxChange();
}

function onDetectorsInvertSelection() {
  for (var i = 0, c = detectorCheckboxs.length; i < c; ++i) {
    var checkBox = detectorCheckboxs[i];
    checkBox.checked = !checkBox.checked;
  }
  onDetectorCheckboxChange();
}

function onDOMContentLoaded() {
  createDetectorCheckboxes();
  bulidHTMLView(getTemplateData(), document.body); // localize
  document.title = $('title').innerText;

  detectorCheckboxs = $('detectors').getElementsByTagName("input");
  initDetectorCheckboxes();

  // Add UI events.
  addTabEvent();
  addDetectorSelectButtonEvent();
  addDetectorCheckboxEvent();

  // Set share button.
  var shareTitle = chrome.i18n.getMessage('opt_shareTitle');
  shareOnWeibo($('shareOnWeibo'), shareTitle);
  shareOnTencent($('shareOnTencent'), shareTitle);
  shareOnTwitter($('shareOnTwitter'), shareTitle);
}

document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
