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

'text_overflow_ellipsis',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var style = chrome_comp.getComputedStyle(node);
  var textOverflow = chrome_comp.getComputedStyle(node).textOverflow;
  var overflow = chrome_comp.getComputedStyle(node).overflow;
  var nodeWidth = chrome_comp.getComputedStyle(node).width;
  if (style && textOverflow == 'ellipsis' && overflow == "hidden") {
    // Firefox doesn't support 'text-overflow:ellipsis', so there will
    // compatibility issue as long as it's used.
    //this.addProblem('RT3005', [node]);
    var childrenDisplay = null;
    var isSetWidth = false;
    for(var i=0,c=node.childNodes.length;i<c;i++){
      if(node.childNodes[i].nodeType!==3){
        childrenDisplay=chrome_comp.getComputedStyle(node.childNodes[i])
          .display;
        isSetWidth = chrome_comp.getDefinedStylePropertyByName
          (node.childNodes[i],false,'width')?true:false;
      if(childrenDisplay == "block" && isSetWidth == false){
        this.addProblem('RT3005', [node]);
      }
     }
    }
  }
}

); // declareDetector

});
