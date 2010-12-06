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
  var wordWrap = chrome_comp.getComputedStyle(node).wordWrap;
  //Increase the filter conditions , When the elements
  //of the TD and set word-wrap:break-word ,no problem.
  if (style && textOverflow == 'ellipsis' && overflow == "hidden" && 
    node.tagName !="TD" && wordWrap != "break-word") {
    var nodeWidth = chrome_comp.getComputedStyle(node).width;
    var childrenWidth= null;
    for(var i=0,c=node.childNodes.length;i<c;i++){
      //If the child element is a block element, 
      //there may be compatibility issues
      if(node.childNodes[i].nodeType!==3 && chrome_comp.getComputedStyle
        (node.childNodes[i]).display=="block"){
        var tempNode= node.childNodes[i].cloneNode(true);
        //To obtain the actual length of the block elements
        tempNode.style.float= "right";
        document.body.appendChild(tempNode);
        childrenWidth = chrome_comp.getComputedStyle(tempNode).width;
        //Remove the temporary elements
        document.body.removeChild(tempNode);
        //If the child element is greater than the actual length of the parent 
        //element length, there are compatibility issues
        if(parseInt(childrenWidth,10)>parseInt(nodeWidth,10)){
          this.addProblem('RT3005', [node]);
        }
      }
    }
  }
}

); // declareDetector

});
