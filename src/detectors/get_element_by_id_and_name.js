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

addScriptToInject(function() {

var winIdList = {};
var winNameList = {};
var docIdList = {};
var docNameList = {};
var ifr;

function hasNameAttribute(element) {
  return element.getAttribute('name') != '';
}

chrome_comp.CompDetect.declareDetector(

'get_element_by_id_and_name',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  ifr = document.createElement('iframe');
  ifr.style.display = 'none !important';
  ifr.src = location;
  ifr.onload = function () {
    document.body.removeChild(ifr);
  }
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var This = this;
  var quirks = chrome_comp.inQuirksMode();
  var id = node.getAttribute('id');
  var name = node.getAttribute('name');
  if (!ifr.parentNode)
    document.body.appendChild(ifr);
  ifr.contentWindow.alert = function () {
    window.eval(arguments);
  }
  if (id && !winIdList[id] && !quirks) {
    chrome_comp.CompDetect.registerSimplePropertyHook(
        ifr.contentWindow, id,
            function (oldValue, newValue, reason) {
              This.addProblem('BX9010', [node]);
              return newValue;
            }, true, true);
    winIdList[id] = node;
  }
  var winNameCList = ['A', 'FRAMESET', 'IMG', 'MAP', 'META', 'EMBED', 'FORM',
      'INPUT', 'OBJECT', 'SELECT', 'TEXTAREA', 'BUTTON'];
  if (name && !winNameList[name] && (winNameCList.indexOf(node.tagName) >= 0)) {
    chrome_comp.CompDetect.registerSimplePropertyHook(
        ifr.contentWindow, name,
            function (oldValue, newValue, reason) {
              This.addProblem('BX9010', [node]);
              return newValue;
            }, true, true);
    winNameList[name] = node;
  }

  /*if (hasNameAttribute(node)) {
    var docIdCList1 = ['FORM', 'IFRAME', 'EMBED'];
    if (id && !docIdList[id] && (docIdCList1.indexOf(node.tagName) >= 0)) {
      chrome_comp.CompDetect.registerSimplePropertyHook(ifr.contentDocument, id,
          function (oldValue, newValue, reason) {
            This.addProblem('BX9028', [node]);
            return newValue;
          }, true, true);
      docIdList[name] = node;
    }
  } else {
    var docIdCList2 = ['IMG', 'EMBED'];
    if (id && !docIdList[id] && (docIdCList2.indexOf(node.tagName) >= 0)) {
      chrome_comp.CompDetect.registerSimplePropertyHook(ifr.contentDocument, id,
          function (oldValue, newValue, reason) {
            This.addProblem('BX9028', [node]);
            return newValue;
          }, true, true);
      docIdList[name] = node;
    }
  }

  var docNameCList = ['IFRAME'];
  if (name && !docNameList[name] && (docNameCList.indexOf(node.tagName) >= 0)) {
    chrome_comp.CompDetect.registerSimplePropertyHook(ifr.contentDocument, name,
        function (oldValue, newValue, reason) {
          This.addProblem('BX9028', [node]);
          return newValue;
        }, true, true);
    docNameList[name] = node;
  }*/
}
); // declareDetector

});
