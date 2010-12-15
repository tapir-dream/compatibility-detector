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

var docElement = document.documentElement;

const INJECT_SCRIPT_EVENT_NAME = 'chrome_comp_injectScript';
const INJECTED_SCRIPT_ATTR_NAME = 'chrome_comp_injectedScript';

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

function addSourceToInject(source, debug) {
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
 * @param scriptFunction a function object or string, it will be converted to
 *     string and inject into the page as eval('(string of scriptFunction)()')
 */
function addScriptToInject(scriptFunction, debug) {
  addSourceToInject('(' + scriptFunction.toString() + ')()', debug);
}

// Set flag in shared dom to indicate the start part has been injected.
docElement.setAttribute('chrome_comp_injected', true);

// Passes compatibility results from the page to the extension background page.
// Event name: 'chrome_comp_result'
// Depends on:
//   documentElement's attribute: chrome_comp_reason, chrome_comp_severity
// Request message format:
//   type('CompatibilityResult'), reason, severity
docElement.addEventListener('chrome_comp_problemDetected', function() {
  var reason = docElement.getAttribute('chrome_comp_reason');
  var severity = docElement.getAttribute('chrome_comp_severity');
  chrome.extension.sendRequest({
    type: 'CompatibilityResult',
    reason: reason,
    severity: severity
  }, function() { });
});

// Triggers endOfDetection event from the page to the extension background page.
// Event name: 'chrome_comp_endOfDetection'
// Request message format:
//   type('EndOfDetection')
docElement.addEventListener('chrome_comp_endOfDetection', function() {
  chrome.extension.sendRequest({ type: 'EndOfDetection' });
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
