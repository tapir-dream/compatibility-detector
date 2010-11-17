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

'floatElementOverflowContainer',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
      return;	
  var nodeDisplayStyle = chrome_comp.getComputedStyle(node).display;
  var nodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  if (nodeDisplayStyle!='none' && nodeFloatStyle!='none'){
		  var nodeWidthStyle = chrome_comp.getComputedStyle(node).width;
		  var nodeDirectionStyle = chrome_comp.getComputedStyle(node).direction;
  }
  else 
	  return;
  if (node.offsetHeight && node.offsetWidth){
		containerWidth = chrome_comp.getComputedStyle(chrome_comp.getContainingBlock(node)).width;    
		if(parseInt(nodeWidthStyle) > parseInt(containerWidth)){ 		   
			if ((nodeFloatStyle == 'right' && nodeDirectionStyle== 'ltr') || (nodeFloatStyle == 'left' && nodeDirectionStyle== 'rtl'))
				this.addProblem('RM8014', [node]);
		}
	}			  
}
); // declareDetector

});
