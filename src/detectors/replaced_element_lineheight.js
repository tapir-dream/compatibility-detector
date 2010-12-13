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

'replaced_element_lineheight',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  function testLineHeightChanged(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.lineHeight;
    var newCompValue;
    nodeEl.style.lineHeight = 'normal';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.lineHeight = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  function testDefinedLineHeight(nodeEl, refValue) {
    var oldInlineValue = nodeEl.style.WebkitAppearance;
    var newCompValue;
    nodeEl.style.WebkitAppearance = 'textfield';
    newCompValue = parseInt(chrome_comp.getComputedStyle(nodeEl).lineHeight);
    if (refValue == ((newCompValue) ? newCompValue : 'normal')) {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return false;
    } else {
      nodeEl.style.WebkitAppearance = (oldInlineValue) ? oldInlineValue : null;
      return true;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  
  if (!chrome_comp.isReplacedElement(node))
    return;
  
  if (node.tagName != 'INPUT')
    return;
  
  var type = node.type.toLowerCase();
  var compLineHeight = parseInt(chrome_comp.getComputedStyle(node).lineHeight);
  var compHeight = parseInt(chrome_comp.getComputedStyle(node).height);
  if (type == 'text' || type == 'password') {
    if (compLineHeight == compHeight) {
      if (testLineHeightChanged(node, 
          (compLineHeight) ? compLineHeight : 'normal')) {
        this.addProblem('RD1012', [node]);
      }
    }
  } else if (type == 'button' || type == 'submit' || type == 'reset') {
      if (testDefinedLineHeight(node, 
          (compLineHeight) ? compLineHeight : 'normal'))
        this.addProblem('RD1012', [node]);
  }
  
}
); // declareDetector

});

