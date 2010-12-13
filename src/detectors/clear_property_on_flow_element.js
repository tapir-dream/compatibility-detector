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

'clear_property_on_flow_element',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  // record the number of nodes
  var continuousNodeCount = 1;
  var elementStyle = chrome_comp.getComputedStyle(node);
  var firstNodeDisplayStyle = elementStyle.display;
  var firstNodeFloatStyle = elementStyle['float'];

  if (node.nextElementSibling) {
    var secondNode = node.nextElementSibling;
    var secondNodeStyle =  chrome_comp.getComputedStyle(secondNode);
    var secondNodeDisplayStyle = secondNodeStyle.display;
    var secondNodeClearStyle = secondNodeStyle.clear;
    var secondNodeFloatStyle = secondNodeStyle['float'];
    continuousNodeCount++;
  } else {
    return;
  }

  if (secondNode.nextElementSibling) {
    var thirdNode = secondNode.nextElementSibling;
    var thirdNodeStyle = chrome_comp.getComputedStyle(thirdNode);
    var thirdNodeDisplayStyle = thirdNodeStyle.display;
    var thirdNodeClearStyle = thirdNodeStyle.clear;
    var thirdNodeFloatStyle = thirdNodeStyle['float'];
    var thirdNodeWidthStyle = thirdNodeStyle.width;
    continuousNodeCount++;
  }

  if (node.offsetHeight != 0 && node.offsetWidth != 0 &&
      firstNodeFloatStyle != 'none' && firstNodeDisplayStyle != 'none') {
    if (secondNode.offsetHeight != 0 && secondNode.offsetWidth != 0 &&
        secondNodeFloatStyle != 'none' && secondNodeDisplayStyle != 'none') {
      // exist at least two continuous nodes
      if (continuousNodeCount >= 2) {
        if (firstNodeFloatStyle != secondNodeFloatStyle) {
          if (secondNodeClearStyle == firstNodeFloatStyle ||
              secondNodeClearStyle == 'both' ||
               secondNodeClearStyle =='all')
            this.addProblem('RM8008', [secondNode]);
        }
        if (firstNodeFloatStyle == secondNodeFloatStyle &&
           continuousNodeCount == 3 && thirdNodeFloatStyle!='none' ) {
          //exist three continuous nodes
          if (secondNodeClearStyle == firstNodeFloatStyle ||
              secondNodeClearStyle == 'both' ||
              secondNodeClearStyle =='all') {
            if (!(thirdNodeFloatStyle == firstNodeFloatStyle &&
                  (thirdNodeClearStyle == firstNodeFloatStyle ||
                   thirdNodeClearStyle == 'both' ||
                   thirdNodeClearStyle == 'all'))) {
              var div = document.createElement('div');
              div.style.height = '0px';
              div.style.padding = '0px';
              div.style.margin = '0px';
              div.style.border = '0px';
              div.style.overflow = 'hidden';
              node.parentNode.insertBefore(div, secondNode);
              //the leaving space of containner
              remainSpace = chrome_comp.getComputedStyle(div).width;
              if (parseInt(thirdNodeWidthStyle) <= parseInt(remainSpace))
                this.addProblem('RM8008', [secondNode]);
                node.parentNode.removeChild(div);
            }
          }
        }
      }
    }
  }
}
); // declareDetector

});
