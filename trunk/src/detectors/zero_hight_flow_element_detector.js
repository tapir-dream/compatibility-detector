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

'zeroHeightFlowElement',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;	
  var nodeDisplayStyle = chrome_comp.getComputedStyle(node).display;
  var nodeClearStyle = chrome_comp.getComputedStyle(node).clear;
  var nodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  if(node.nextElementSibling){
  var nextNode = node.nextElementSibling;
  var nextNodeDisplayStyle = chrome_comp.getComputedStyle(nextNode).display;
  var nextNodeClearStyle = chrome_comp.getComputedStyle(nextNode).clear;
  var nextNodeFloatStyle = chrome_comp.getComputedStyle(nextNode).float;
  var nextNodeWidthStyle = chrome_comp.getComputedStyle(nextNode).width;
  }
  else
  	return;
  if(node.offsetHeight == '0' && node.offsetWidth!='0' && nodeFloatStyle!='none' && nodeDisplayStyle!='none')  
	  if(nextNode.offsetHeight!='0' && nextNode.offsetWidth!='0' && nextNodeFloatStyle!='none' && nextNodeDisplayStyle!='none')
		  if(nodeFloatStyle == nextNodeFloatStyle){ 
				if(nextNodeClearStyle!=nodeFloatStyle && nextNodeClearStyle!='both' && nextNodeClearStyle!='all'){  
					var div = document.createElement('div');
					div.style.height = '0px';
					div.style.padding = '0px';
					div.style.margin = '0px';
					div.style.border = '0px';
					div.style.overflow = 'hidden';
					node.style.height='1px';         
					node.parentNode.insertBefore(div, nextNode);
					remainSpace = chrome_comp.getComputedStyle(div).width;  //the leaving space of containner
					if(parseInt(nextNodeWidthStyle) <= parseInt(remainSpace))
						this.addProblem('RM1004', [node]);
				}
				node.style.height='0px';
				node.parentNode.removeChild(div);
		  }
			  
}
); // declareDetector

});
