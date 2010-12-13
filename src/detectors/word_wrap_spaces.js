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

'word_wrap_spaces',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  function getDefaultDisplay(element){
    var elementFloat = element.style.float;
    var elementPosition = element.style.position;
    var elementDisplay = element.style.display;
    element.style.float = "none !important";
    element.style.position = "static !important";
    element.style.display="";
    var defaultDisplay = chrome_comp.getComputedStyle(element).display;
    element.style.float = null;
    element.style.position = null;
    element.style.display = null;
    element.style.float = (elementFloat)?elementFloat:null;
    element.style.position = (elementPosition)?elementPosition:null;
    element.style.display = (elementDisplay)?elementDisplay:null;
    return defaultDisplay;
  }
  var style = chrome_comp.getComputedStyle(node);
  var nodeDisplay = style.display;
  //debugger;
  var nextSibling = node.nextSibling;
  var previousSibling = node.previousSibling;
  var previousreg = /^[\u0020\u0009]/g;
  var nextreg = /[\u0020\u0009]$/g;
  if(nodeDisplay == "none" && getDefaultDisplay(node) == "block"){
    if(nextSibling.nodeType == 3 && previousSibling.nodeType !=3){
       if(previousreg.test(nextSibling.nodeValue)){
        this.addProblem('RT1008', [node]);
      }
     }
  }

  if((node.tagName == "INPUT" && node.type == "hidden") ||
    (getDefaultDisplay(node) == "inline" && nodeDisplay == "none")){
    if(nextSibling.nodeType == 3 && previousSibling.nodeType == 3){
       if(previousreg.test(nextSibling.nodeValue)
         && nextreg.test(previousSibling.nodeValue)){
        this.addProblem('RT1008', [node]);
      }
    }
  }


}
); // declareDetector

});
