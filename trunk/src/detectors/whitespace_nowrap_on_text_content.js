/**
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

'whitespace_nowrap_on_text_content',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function isInlineContent(nodeEl) {
    if (nodeEl.nodeType == 3)
      return true;
    if (nodeEl.nodeType == 1) {
      var dis = chrome_comp.getComputedStyle(nodeEl).display;
      var inlineList = ['inline', 'inline-block', 'inline-table'];
      if (inlineList.indexOf(dis) != -1)
        return true;
    }
    return false;
  }

  function isPureInlineElement(nodeEl) {
    if (nodeEl.nodeType == 3)
      return false;
    if (nodeEl.nodeType == 1) {
      var descendants = nodeEl.getElementsByTagName('*');
      var inlineList = ['inline', 'inline-block', 'inline-table'];
      for (var i = 0, j = descendants.length; i < j; i++) {
        if (chrome_comp.getComputedStyle(descendants[i]).display != 'inline')
          return false;
        if (chrome_comp.isReplacedElement(descendants[i]))
          return false;
      }
      return true;
    }
  }

  function isWhiteSpaceNowrap(nodeEl) {
    return chrome_comp.getComputedStyle(nodeEl).whiteSpace == 'nowrap';
  }

  function isOverflowCB(nodeElRect, CBRect) {
    if ((nodeElRect.left >= CBRect.right) || (nodeElRect.right <= CBRect.left))
      return true;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (isWhiteSpaceNowrap(node))
    return;

  var ch = node.childNodes, nodeBounding = node.getBoundingClientRect();
  for (var i = 1, j = ch.length; i < j; i++) {
    if (isInlineContent(ch[i]) && (isInlineContent(ch[i - 1]))) {
      if ((ch[i].nodeType != 1) || (ch[i - 1].nodeType != 1))
        continue;
      if (!isPureInlineElement(ch[i]) || !isPureInlineElement(ch[i - 1])) {
        if (!isWhiteSpaceNowrap(ch[i]) || !isWhiteSpaceNowrap(ch[i - 1]))
          continue;
        var chBounding = ch[i].getBoundingClientRect();
        if (isOverflowCB(chBounding, nodeBounding))
          this.addProblem('RT1012', [ch[i]]);
      }
    }
  }
}
); // declareDetector

});

