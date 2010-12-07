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

function getIdeographicSpaceTextNode(element) {
  var ch = element.childNodes;
  var ret = [];
  if (ch.length < 1)
    return ret;
  for (var i = 0, j = ch.length; i < j; i++) {
    if (ch[i].nodeType == 1)
      continue;
    if ((ch[i].nodeType == 3) && (/\u3000/g.test(ch[i].nodeValue)))
      ret.push(ch[i]);
  }
  return ret;
}

function detectorStyle(action, element) {
  if (action == 'create') {
    var style = document.createElement('style');
    style.textContent = 'det.ideo { display:inline-block !important; ' +
        'text-indent:0 !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    return style;
  } else if (action == 'remove') {
    document.getElementsByTagName('head')[0].removeChild(element);
  }
}

function getPreviousElement(element) {
  var p = element.previousSibling;
  if (!p)
    return;
  var ch = p.children;
  return (ch.length > 0) ? ch[ch.length - 1] : p;
}

chrome_comp.CompDetect.declareDetector(

'full_shape_space_no_wrap',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (context.isDisplayNone())
    return;

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if ((node.tagName == 'HEAD') || (node.tagName == 'HTML'))
    return;

  if (node.tagName == 'DET')
    return;

  var textNodes = getIdeographicSpaceTextNode(node);
  if (textNodes.length < 1)
    return;
  var IS = '　';
  var originalNode = node;
  var style = detectorStyle('create');
  var oriHTML = node.innerHTML;
  for (var i = 0, j = textNodes.length; i < j; i++) {
    var text = textNodes[i].nodeValue;
    var detText = text.replace(/(.)/g, '<det class="ideo">$1</det>');
    node.innerHTML = node.innerHTML.replace(text, detText);
  }
  var qsNode = node.querySelectorAll('det.ideo');
  if (qsNode.length < 1)
    return;
  var qsNodeRect;
  var qsPrevNodeRect;
  var reported = false;
  var originalTop;
  var changedTop;
  for (var m = 0, n = qsNode.length; m < n; m++) {
    if (qsNode[m].innerHTML == IS) {
      var isRect = qsNode[m].getBoundingClientRect().left;
      var prev = qsNode[m].previousElementSibling;
      if (!prev)
        continue;
      var prevRect = prev.getBoundingClientRect().left;
      if ((prevRect > isRect)) {
        var pe = getPreviousElement(qsNode[m]);
        if (pe && pe.tagName != 'BR') {
          this.addProblem('BX1009', [qsNode[m]]);
          break;
        }
      }
    }
  }
  node.innerHTML = oriHTML;
  detectorStyle('remove', style);
  node = originalNode;
}
); // declareDetector

});
