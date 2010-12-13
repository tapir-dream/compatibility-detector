/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'document_type_and_boxSizing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isIEDTDBug(nodeEl) {
    var html = document.documentElement, prev = html;
    while (prev.previousSibling)
      prev = prev.previousSibling;
    if (prev && prev.nodeType == 8)
      return true;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tn = node.tagName, tp;
  if (window.chrome_comp.getComputedStyle(node).display == 'none')
    return;
  var w = chrome_comp.getDefinedStylePropertyByName(node, true, 'width');
  var h = chrome_comp.getDefinedStylePropertyByName(node, true, 'height');
  var elementStyle = chrome_comp.getComputedStyle(node);
  var bt = parseInt(elementStyle.borderTopWidth,10);
  var br = parseInt(elementStyle.borderRightWidth,10);
  var bb = parseInt(elementStyle.borderBottomWidth,10);
  var bl = parseInt(elementStyle.borderLeftWidth,10);
  var pt = parseInt(elementStyle.paddingTopWidth,10);
  var pr = parseInt(elementStyle.paddingRightWidth,10);
  var pb = parseInt(elementStyle.paddingBottomWidth,10);
  var pl = parseInt(elementStyle.paddingLeftWidth,10);

  if ((!w || w == 'auto') && (!h || h == 'auto'))
    return;
  if (!bt && !br && !bb && !bl && !pt && !pr && !pb && !pl)
    return;

  if (tn == 'INPUT')
    tp = node.type.toLowerCase();

  if (tn == 'TABLE' || tn == 'BUTTON' ||
      (tn == 'INPUT' &&
      (tp == 'button' || tp == 'submit' || tp == 'reset')))
    return;

  var doctypeInIE;
  var doctypeInWebKit;
  var diffMap;
  var pid = (document.doctype) ? document.doctype.publicId : 0;
  var sid = (document.doctype) ? document.doctype.systemId : 0;
  var cm = document.compatMode.toLowerCase();
  var boxSizing = window.chrome_comp.getComputedStyle(node).webkitBoxSizing;
  doctypeInIE = doctypeInWebKit = (cm == 'backcompat') ? 'Q' : 'S';
  if (isIEDTDBug(node)) {
    doctypeInIE = 'Q';
    if (tn == 'HTML')
      this.addProblem('HG8001', [node]);
  }
  diffMap = {
    '-//W3C//DTD HTML 4.0 Transitional//EN': {
      'systemId': 'http://www.w3.org/TR/html4/loose.dtd',
      'IE': 'S',
      'WebKit': 'Q'
    },
    'ISO/IEC 15445:2000//DTD HTML//EN': {
      'systemId': '',
      'IE': 'Q',
      'WebKit': 'S'
    },
    'ISO/IEC 15445:1999//DTD HTML//EN': {
      'systemId': '',
      'IE': 'Q',
      'WebKit': 'S'
    }
  }
  if ((tn == 'IMG') && (boxSizing != 'border-box'))
    return;
  if ((tn == 'HR') && (boxSizing == 'border-box'))
    return;
  if (diffMap[pid]) {
    if (diffMap[pid]['systemId'] == sid) {
      doctypeInIE = diffMap[pid]['IE'];
      doctypeInWebKit = diffMap[pid]['WebKit'];
    }
  }
  if (!window.chrome_comp.isReplacedElement(node)) {
    if (doctypeInIE == 'Q' && boxSizing != 'border-box') {
      this.addProblem('RD8001', [node]);
      return;
    }
    if (doctypeInIE == 'S' && boxSizing == 'border-box') {
      this.addProblem('RD8001', [node]);
      return;
    }
  } else {
    if (((tn == 'INPUT' && (tp == 'text' || tp == 'password')) ||
        (tn == 'TEXTAREA')) && (doctypeInIE != doctypeInWebKit)) {
      if (doctypeInIE == 'Q' && boxSizing != 'border-box')
        this.addProblem('RD8001', [node]);
      return;
    }
    if (tn == 'IFRAME' && doctypeInIE == 'Q') {
      this.addProblem('RD8001', [node]);
      return;
    }
  }
}
); // declareDetector

});