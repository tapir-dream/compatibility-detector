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

chrome_comp.CompDetect.declareDetector(

'img_iframe_object_embed_baseline',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*
 * Step:
 *
 * 1. Get doctype of the page in IE6, IE7, IE8 and Chrome, including
 *    Almost Standards Mode.
 * 2. If the containing block of current replace element is with
 *    other content inside, then return.
 * 3. If Empty node is existent, report problem as the case might be.
 *
 * Defect:
 * Only consider IE6, IE7, IE8 and Chrome currently.
 */


function constructor(rootNode) {
  function getMode() {
    function isIEDTDBug() {
      var html = document.documentElement;
      var prev = html;
      while (prev.previousSibling) {
        prev = prev.previousSibling;
      }
      if (prev && prev.nodeType == 8)
        return true;
    }

    function hasBase() {
      var iframe = document.createElement('iframe');
      var div = document.createElement('div');
      div.appendChild(iframe);
      document.documentElement.appendChild(div);
      var n = div.offsetHeight == iframe.offsetHeight;
      document.documentElement.removeChild(div);
      return !n;
    }

    var doctypeInIE6;
    var doctypeInIE7;
    var doctypeInIE8;
    var doctypeInWebKit;
    var diffMap;
    var pid = (document.doctype) ? document.doctype.publicId : 0;
    var sid = (document.doctype) ? document.doctype.systemId : 0;
    var qk = chrome_comp.inQuirksMode();
    doctypeInWebKit = (qk) ? 'Q' : 'S';
    doctypeInIE = doctypeInWebKit;
    if (isIEDTDBug()) {
      doctypeInIE6 = 'Q';
      doctypeInIE7 = 'Q';
      doctypeInIE8 = 'Q';
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
    if (diffMap[pid]) {
      if (diffMap[pid]['systemId'] == sid) {
        doctypeInIE6 = diffMap[pid]['IE'];
        doctypeInIE7 = diffMap[pid]['IE'];
        doctypeInIE8 = diffMap[pid]['IE'];
        doctypeInWebKit = diffMap[pid]['WebKit'];
      }
    }
    if (hasBase()) {
      if (doctypeInWebKit != 'Q')
        doctypeInWebKit = 'S';
      if (doctypeInIE8 != 'Q')
        doctypeInIE8 = 'S';
    } else {
      if (doctypeInWebKit != 'Q')
        doctypeInWebKit = 'A';
      if (doctypeInIE8 != 'Q')
        doctypeInIE8 = 'A';
    }
    if (doctypeInIE6 != 'Q')
      doctypeInIE6 = 'A';
    if (doctypeInIE7 != 'Q')
      doctypeInIE7 = 'A';
    return {
      IE6 : doctypeInIE6,
      IE7 : doctypeInIE7,
      IE8 : doctypeInIE8,
      WebKit : doctypeInWebKit
    };
  }
  this.documentMode = getMode();
},

function checkNode(node, context) {
  function hasTextNode(element) {
    var txt = element.parentNode.innerText;
    var reWS = /^\w+$/g;
    return element.parentNode.innerText != '';
  }

  function hasEmptyNode(element) {
    return element.parentNode.childNodes.length > 1;
  }

  function isOnlyChild(element) {
    var parent = element.parentNode;
    var dis = element.style.display;
    element.style.display = 'none !important';
    var h = parseInt(chrome_comp.getComputedStyle(element).height);
    element.style.display = null;
    element.style.display = (dis) ? dis : null;
    return !h;
  }

  function isBaseline(element) {
    return chrome_comp.getComputedStyle(element).verticalAlign == 'baseline';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tagList = ['IMG', 'IFRAME', 'OBJECT', 'EMBED'];
  if (tagList.indexOf(node.tagName) == -1)
    return;

  if (!isBaseline(node))
    return;

  if (!isOnlyChild(node))
    return;

  if (hasTextNode(node))
    return;

  var mode = this.documentMode;
  var hasEmptyNoWarnning = {
    IE6: 'SAQ',
    IE7: 'SAQ',
    IE8: 'SQ',
    WebKit: 'S'
  };
  var hasNoEmptyNoWarnning = {
    IE6: 'SAQ',
    IE7: 'SAQ',
    IE8: 'AQ',
    WebKit: 'AQ'
  }

  if (hasEmptyNode(node)) {
    if ((hasEmptyNoWarnning.IE6.indexOf(mode.IE6) == -1) ||
        (hasEmptyNoWarnning.IE7.indexOf(mode.IE7) == -1) ||
        (hasEmptyNoWarnning.IE8.indexOf(mode.IE8) == -1) ||
        (hasEmptyNoWarnning.WebKit.indexOf(mode.WebKit) == -1))
      this.addProblem('RD3020', [node]);
  } else {
    if ((hasNoEmptyNoWarnning.IE6.indexOf(mode.IE6) == -1) ||
        (hasNoEmptyNoWarnning.IE7.indexOf(mode.IE7) == -1) ||
        (hasNoEmptyNoWarnning.IE8.indexOf(mode.IE8) == -1) ||
        (hasNoEmptyNoWarnning.WebKit.indexOf(mode.WebKit) == -1))
      this.addProblem('RD3020', [node]);
  }
}
); // declareDetector

});

