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

'text_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

function construtor(){
  this.getCompatMode_ = function(){
    function isIEDTDBug() {
      var html = document.documentElement, prev = html;
      while (prev.previousSibling) { prev = prev.previousSibling; }
      if (prev && prev.nodeType == 8) {
        return true;
      }
    }

    var doctypeInIE, doctypeInWebKit, diffMap,
        pid = (document.doctype) ? document.doctype.publicId : 0,
        sid = (document.doctype) ? document.doctype.systemId : 0,
        cm = document.compatMode.toLowerCase();
    doctypeInIE = doctypeInWebKit = (cm == 'backcompat') ? 'Q' : 'S';
    if (isIEDTDBug()) {
      doctypeInIE = 'Q';
      if (tn == 'HTML')
        this.addProblem('HG8001', [node]);
    }
    diffMap = {
      "-//W3C//DTD HTML 4.0 Transitional//EN": {
        "systemId": "http://www.w3.org/TR/html4/loose.dtd",
        "IE": "S",
        "WebKit": "Q"
      },
      "ISO/IEC 15445:2000//DTD HTML//EN": {
        "systemId": "",
        "IE": "Q",
        "WebKit": "S"
      },
      "ISO/IEC 15445:1999//DTD HTML//EN": {
        "systemId": "",
        "IE": "Q",
        "WebKit": "S"
      }
    }
    if (diffMap[pid]) {
      if (diffMap[pid]['systemId'] == sid) {
        doctypeInIE = diffMap[pid]['IE'];
        doctypeInWebKit = diffMap[pid]['WebKit'];
      }
    }
    return {doctypeInIE:doctypeInWebKit,
      doctypeInWebKit:doctypeInWebKit};
  }();
}, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (this.getCompatMode_.doctypeInIE === 'S')
    return;

  var style = chrome_comp.getComputedStyle(node),
      display = style.display,
      textAlign = style.textAlign,
      direction = style.direction;

  if ((display == 'block' || display == 'inline-block' ||
       display == 'table-cell') &&
      (textAlign == 'center' ||
       (direction == 'ltr' && textAlign == 'right') ||
       (direction == 'rtl' && textAlign == 'left'))) {
    var parentElementMaxWidth = parseInt(node.style.width,10);
    var child = node.firstElementChild;
    do {
      if (child) {
        var childStyle = chrome_comp.getComputedStyle(child);
        if (childStyle.display == 'block' &&
            childStyle.float == 'none' &&
            (childStyle.position == 'static' ||
             childStyle.position == 'relative')) {
          var childWidth = parseInt(child.style.width,10) +
              parseInt(childStyle.paddingLeft,10) +
              parseInt(childStyle.paddingRight,10);
          if ( Math.abs( parseInt(childStyle.marginLeft,10) -
                         parseInt(childStyle.marginRight,10)) > 1
                && childWidth + 1 < parentElementMaxWidth ) {
            this.addProblem('RT8003',
                { nodes: [node], details: parentElementMaxWidth + 'vs' + childWidth });
            return;
          }
        }
        child = child.nextElementSibling;
      }
    } while (child && child != node.lastElementChild);
  }
}
); // declareDetector

});
