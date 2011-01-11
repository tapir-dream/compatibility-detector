/**
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

var VALID_ALIGN_MIDDLE_TAGS = {
  IMG: true,
  OBJECT: true,
  APPLET: true,
  EMBED: true,
  IFRAME: true,
  HR: true
};

chrome_comp.CompDetect.declareDetector(

'align_middle',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  /*
   * The comment or XML declaration before DTD will make the DTD be invalid in
   * IE, so that the HTML document will be in quirks mode in IE.
   */
  function hasCommentBeforeDTD(element) {
    var prev = element;
    if (!prev)
      return;
    while (prev.previousSibling)
      prev = prev.previousSibling;
    if (prev && prev.nodeType == 8)
      return prev;
  }

  // There are several strange DTDs that have the document mode in IE and
  // non-IE browser be different. And we must know the real document mode
  // triggered by the present DTD in IE and WebKit browsers.
  var doctypeInIE;
  var doctypeInWebKit;
  var doctypeInGecko;
  var diffMap;
  var doctype = document.doctype;
  var compatMode = document.compatMode.toLowerCase();
  var publicId = (doctype) ? doctype.publicId : 0;
  var systemId = (doctype) ? doctype.systemId : 0;
  doctypeInIE = doctypeInWebKit = doctypeInGecko =
    (compatMode == 'backcompat') ? 'Q' : 'S';
  if (hasCommentBeforeDTD(rootNode))
    doctypeInIE = 'Q';
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
  if (diffMap[publicId]) {
    if (diffMap[publicId]['systemId'] == systemId) {
      doctypeInIE = diffMap[publicId]['IE'];
      doctypeInWebKit = diffMap[publicId]['WebKit'];
    }
  }

  // A DOCTYPE declaration with an internal subset will trigger standards mode
  // in Firefox, and it will trigger quirks mode in Webkit.
  // for example: <!DOCTYPE HTML [ <!ELEMENT TEST - - (P) > ]>
  if (doctypeInWebKit == 'Q' && doctype && !publicId && !systemId) {
    doctypeInGecko = 'S';
  }

  this.doctypes = {
    ie: doctypeInIE,
    webkit: doctypeInWebKit,
    gecko: doctypeInGecko
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (!node.hasAttribute('align') ||
      chrome_comp.getAttributeLowerCase(node, 'align') != 'middle')
    return;
  var tagName = node.tagName;
  var doctypes = this.doctypes;
  if (!VALID_ALIGN_MIDDLE_TAGS.hasOwnProperty(node.tagName)) {
    if ((tagName == 'DIV' || tagName == 'P') &&
        chrome_comp.getComputedStyle(node).textAlign == '-webkit-center')
      this.addProblem('HA1003', [node]);
    else if (/H[1-6]/.test(tagName))
      this.addProblem('HA1003', [node]);
    else if (tagName == 'TABLE' && doctypes.gecko == 'Q')
      this.addProblem('HA1003', [node]);
    else if (tagName == 'TH' && (doctypes.gecko == 'S' || doctypes.ie == 'S'))
      this.addProblem('HA1003', [node]);
    else if (tagName == 'TD' && doctypes.gecko == 'S')
      this.addProblem('HA1003', [node]);
  }
}
); // declareDetector

});
