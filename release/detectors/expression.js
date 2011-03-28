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

/**
 * @fileoverview Checking CSS expression in all style string.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=150
 *
 * CSS expressions are executed only in IE6 IE7 IE8(Q), in IE8(S) they are
 * deprecate.
 *
 * The detector check all style tag, and all tag style attribute value,
 * use RegExp test whether the value contains expression style.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'expression',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.expressionRegExp_ = /[a-zA-Z-]+?:\s*expression\s*\(/i;
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var cssData;
  if (node.tagName == 'STYLE') {
    cssData = node.innerText;
  } else {
    cssData = node.getAttribute('style') + '';
  }
  if (this.expressionRegExp_.test(cssData))
    this.addProblem('BT9010',{
      nodes: [node],
      details: 'Problem: ' + chrome_comp.ellipsize(cssData, 50)
    });
}
); // declareDetector

});
