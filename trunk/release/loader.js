/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function log(message) {
  // Uncomment this for debugging. Comment it before release:
  // window.console.log(message);
}

var DETECTION_STATUS_NAME = 'chrome_comp_detection_status';
var CHROME_COMP_LOAD = 'chrome_comp_load';

var detectionEnabled =
    window.sessionStorage[DETECTION_STATUS_NAME] ==
        window.location.href;

// Delete the key so that refresh the page again will get a clean page.
delete window.sessionStorage[DETECTION_STATUS_NAME];

if (detectionEnabled) {

var docElement = document.documentElement;

var INJECT_SCRIPT_EVENT_NAME = 'chrome_comp_injectScript';
var INJECTED_SCRIPT_ATTR_NAME = 'chrome_comp_injectedScript';
var PROBLEM_DETECTED_EVENT_NAME = 'chrome_comp_problemDetected';

// Creates a script node on the page to inject arbitary script from content
// script to the page.
// Use window.eval(scriptString) to inject the script.
var script = document.createElement('script');
script.appendChild(document.createTextNode(
  'document.documentElement.addEventListener("' + INJECT_SCRIPT_EVENT_NAME +
  // The name of this function is an indicator of injected code
  // (see chrome_comp.dumpStack).
  '", function chrome_comp_injector() {' +
  'try {' +
  'window.eval(document.documentElement.getAttribute("' +
  INJECTED_SCRIPT_ATTR_NAME + '"));' +
  '} catch (e) { window.console.log(e.stack || e); }' +
  'document.documentElement.removeAttribute("' + INJECTED_SCRIPT_ATTR_NAME +
  '");});'));
docElement.appendChild(script);

// Set flag in shared dom to indicate the start part has been injected.
docElement.setAttribute('chrome_comp_injected', true);

// Passes compatibility results from the page to the extension background page.
// Event name: chrome_comp_problemDetected
// Depends on:
//   documentElement's attribute: chrome_comp_reason, chrome_comp_severity,
//   chrome_comp_description, chrome_comp_occurrencesNumber
// Request message format:
//   type('CompatibilityResult'), reason, severity
docElement.addEventListener(PROBLEM_DETECTED_EVENT_NAME, function() {
  var reason = docElement.getAttribute('chrome_comp_reason');
  var severity = docElement.getAttribute('chrome_comp_severity');
  var description = docElement.getAttribute('chrome_comp_description');
  var occurrencesNumber =
      docElement.getAttribute('chrome_comp_occurrencesNumber');

  chrome.extension.sendRequest({
    type: 'CompatibilityResult',
    reason: reason, // typeId, RCA Number
    severity: severity,
    description: description,
    occurrencesNumber: occurrencesNumber
  }, function() { });
});

// Triggers endOfDetection event from the page to the extension background page.
// Event name: 'chrome_comp_endOfDetection'
// Request message format:
//   type('EndOfDetection'), totalProblems
docElement.addEventListener('chrome_comp_endOfDetection', function() {
  chrome.extension.sendRequest({
    type: 'EndOfDetection',
    totalProblems: docElement.getAttribute('totalProblems')
  });
});

// For the page to get language dependent message text from the extension.
// Event name: 'chrome_comp_getMessage'
// Depends on:
//   documentElement's attribute: chrome_comp_messageName,
//   chrome_comp_messageParams, chrome_comp_messageResult
docElement.addEventListener('chrome_comp_getMessage', function() {
  var name = docElement.getAttribute('chrome_comp_messageName');
  var params = docElement.getAttribute('chrome_comp_messageParams');
  docElement.setAttribute('chrome_comp_messageResult',
      chrome.i18n.getMessage(name, params ? JSON.parse(params) : undefined));
});

} // end if

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'DetectProblems':
      detectProblems();
      break;
    case 'getCrossOriginCSSFinished':
      getCrossOriginCSSFinished(request.data);
      break;
  }
});

/**
 * @param {object} data maps url to css text
 */
function getCrossOriginCSSFinished(data) {
  if (data) {
    for (var url in data) {
      log('Insert cross origin style sheet : ' + url);
      insertStyleNodeAfter(crossOriginStyleSheets[url], data[url]);
    }
  }
  var event = document.createEvent('Event');
  event.initEvent(CHROME_COMP_LOAD, true, true);
  window.dispatchEvent(event);
}

// Maps url to style sheet link nodes.
var crossOriginStyleSheets = {};

function initCrossOriginLinkMap() {
  var styleSheets = document.styleSheets;
  for (var i = 0, c = styleSheets.length; i < c; ++i) {
    var styleSheet = styleSheets[i];
    if (styleSheet.cssRules == null && styleSheet.ownerNode !== null) {
      crossOriginStyleSheets[styleSheet.href] = styleSheet.ownerNode;
    }
  }
}

function getCrossOriginStyleSheetsURLMap() {
  var urlMap = {};
  for (var url in crossOriginStyleSheets)
    urlMap[url] = true;
  return urlMap;
}

var detectionStarted = false;

function detectProblems() {
  if (!detectionEnabled) {
    window.sessionStorage[DETECTION_STATUS_NAME] =
        window.location.href;
    window.location.reload();
    return;
  }

  if ('complete' != document.readyState)
    return;
  if (detectionStarted)
    return;
  detectionStarted = true;
  initCrossOriginLinkMap();
  var keys = Object.keys(crossOriginStyleSheets);
  if (keys.length) {
    log('getCrossOriginCSS' + ' : ' + keys.length);
    chrome.extension.sendRequest({
      type: 'getCrossOriginCSS',
      urlMap: getCrossOriginStyleSheetsURLMap()
    });
  } else {
    getCrossOriginCSSFinished();
  }
}

function insertStyleNodeAfter(node, cssText) {
  var styleNode = document.createElement('style');
  styleNode.appendChild(document.createTextNode(cssText));
  inserAfter(node, styleNode);
}

function inserAfter(node, newNode) {
  var parentNode = node.parentNode;
  var nextSibling = node.nextSibling;
  if (nextSibling)
    parentNode.insertBefore(newNode, nextSibling);
  else
    parentNode.appendChild(newNode);
}

function addSourceToInject(source, debug) {
  if (!detectionEnabled) {
    return;
  }

  if (debug) {
    var script = document.createElement('script');
    script.appendChild(document.createTextNode(source));
    docElement.appendChild(script);
  } else {
    var event = document.createEvent('Event');
    event.initEvent(INJECT_SCRIPT_EVENT_NAME, true, true);
    docElement.setAttribute(INJECTED_SCRIPT_ATTR_NAME, source);
    docElement.dispatchEvent(event);
  }
}

/**
 * Injects script from content script to the page.
 * @param {function} scriptFunction A function object (or string), it will be
 *     injected into the page as eval('(scriptFunction.toString())()').
 */
function addScriptToInject(scriptFunction, debug) {
  addSourceToInject('(' + scriptFunction.toString() + ')()', debug);
}

/**
 * Creates shared code both in content script and in page script.
 * @param {function} scriptFunction It will be injected to the page, and also
 *     executed in content script.
 */
function addScriptToInjectAndExecuteInContentScript(scriptFunction) {
  addScriptToInject(scriptFunction);
  scriptFunction();
}

window.addEventListener('load', function() {
  if (detectionEnabled)
    detectProblems();
  // Send 'PageLoad' message to popup so that it will re-check this page.
  chrome.extension.sendRequest({
    type: 'PageLoad'
  });
});

// Send 'PageUnloaded' message to background for it to clean up result cache
window.addEventListener('unload', function() {
  chrome.extension.sendRequest({
    type: 'PageUnloaded'
  });
});
