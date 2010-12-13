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

'shrink_to_fit_and_replace_element_width',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  //filter non-replace element
  if ( !chrome_comp.isReplacedElement(node) && node.tagName != 'MARQUEE')
    return;

  var parentElement,elementWidth;

  //detector marquee element
  if ( node.tagName == 'MARQUEE' ){
     elementWidth = chrome_comp.getDefinedStylePropertyByName(node,
       false, 'width');
     if ( elementWidth != undefined ) return;
     if ( !chrome_comp.isShrinkToFit(getParentElement(node)) ) return;

     //Hit the target!
     this.addProblem('RD1021', [node]);
     return;
  }

  //detector replace element element
  elementWidth = chrome_comp.getDefinedStylePropertyByName(node,
    false, 'width');
  if ( elementWidth == undefined ) return ;
  if ( elementWidth.toString().slice(-1) != "%" ) return;
  if ( !chrome_comp.isShrinkToFit(getParentElement(node)) ) return;

  //Hit the target!
  this.addProblem('RD1021', [node]);
  return;

  function getParentElement(node){
    var parentNode = node.parentNode;
    while (parentNode.nodeType != 1){
      parentNode = node.parentNode;
    }
    return parentNode;
  }
}
); // declareDetector

});
