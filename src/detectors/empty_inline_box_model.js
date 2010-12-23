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

chrome_comp.CompDetect.declareDetector(

'empty_inline_box_model',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  var blockList = ['BR', 'IMG'];
  if (blockList.indexOf(node.tagName) != -1)
    return;

  if (chrome_comp.getComputedStyle(node).display != 'inline')
    return;

  var reWS = /^\s*$/;
  var reWSEnd = /.+\s+$/;
  var t = 'transparent';
  if (!reWS.test(node.textContent))
    return;
  var style = chrome_comp.getComputedStyle(node);
  var btw = parseInt(style.borderTopWidth, 10);
  var brw = parseInt(style.borderRightWidth, 10);
  var bbw = parseInt(style.borderBottomWidth, 10);
  var blw = parseInt(style.borderLeftWidth, 10);
  var btc = style.borderTopColor;
  var brc = style.borderRightColor;
  var bbc = style.borderBottomColor;
  var blc = style.borderLeftColor;
  var pt = parseInt(style.paddingTop, 10);
  var pr = parseInt(style.paddingRight, 10);
  var pb = parseInt(style.paddingBottom, 10);
  var pl = parseInt(style.paddingLeft, 10);
  var bi = chrome_comp.getComputedStyle(node).backgroundImage;
  var bc = chrome_comp.getComputedStyle(node).backgroundColor;
  if (((btw || brw || bbw || blw) && (btc != t || brc != t || bbc != t ||
      blc != t)) || ((pt || pr || pb || pl) && (bi || bc != t))) {
    this.addProblem('RD3029', [node]);
  }
  var p = node.previousSibling;
  if (node.tagName == 'Q')
    return;
  if (!p)
    return;
  if (p.nodeType == 1) {
    if (chrome_comp.getComputedStyle(p).display == 'inline') {
      if (reWSEnd.test(p.textContent))
        this.addProblem('BW9012', [node]);
    }
  } else if (p.nodeType == 3) {
    if (reWSEnd.test(p.nodeValue))
      this.addProblem('BW9012', [node]);
  }
}
); // declareDetector

});

