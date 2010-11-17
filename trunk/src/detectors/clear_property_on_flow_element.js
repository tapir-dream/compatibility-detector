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
  var continuousNodeCount =1;	//record the number of nodes
  var firstNodeDisplayStyle = chrome_comp.getComputedStyle(node).display;
  var firstNodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  if(node.nextElementSibling){
	  var secondNode = node.nextElementSibling;
	  var secondNodeDisplayStyle = chrome_comp.getComputedStyle(secondNode).display;
	  var secondNodeClearStyle = chrome_comp.getComputedStyle(secondNode).clear;
	  var secondNodeFloatStyle = chrome_comp.getComputedStyle(secondNode).float;
	  continuousNodeCount++;
  }
  else            
    return;
  if(secondNode.nextElementSibling){
	  var thirdNode = secondNode.nextElementSibling;
	  var thirdNodeDisplayStyle = chrome_comp.getComputedStyle(thirdNode).display;
	  var thirdNodeClearStyle = chrome_comp.getComputedStyle(thirdNode).clear;
	  var thirdNodeFloatStyle = chrome_comp.getComputedStyle(thirdNode).float;
	  var thirdNodeWidthStyle = chrome_comp.getComputedStyle(thirdNode).width;
	  continuousNodeCount++;
  }
  /*====*/
  if(node.offsetHeight!='0' && node.offsetWidth!='0' && firstNodeFloatStyle!='none' && firstNodeDisplayStyle!='none')  
	  if(secondNode.offsetHeight!='0' && secondNode.offsetWidth!='0' && secondNodeFloatStyle!='none' && secondNodeDisplayStyle!='none'){
		  if(continuousNodeCount >= 2){  // exist at least two continuous nodes
 			 if(firstNodeFloatStyle != secondNodeFloatStyle){   
				if(secondNodeClearStyle == firstNodeFloatStyle || secondNodeClearStyle == 'both' || secondNodeClearStyle =='all')  
					this.addProblem('RM8008', [secondNode]);
			  }
		 	 if(firstNodeFloatStyle == secondNodeFloatStyle && continuousNodeCount == 3 && thirdNodeFloatStyle!='none' ){ 
				  //exist three continuous nodes
				if(secondNodeClearStyle == firstNodeFloatStyle || secondNodeClearStyle == 'both' || secondNodeClearStyle =='all'){  
					if(thirdNodeFloatStyle == firstNodeFloatStyle && (thirdNodeClearStyle == firstNodeFloatStyle || thirdNodeClearStyle == 'both' || thirdNodeClearStyle                        =='all')){
						}
					else{
						  var div = document.createElement('div');
						  div.style.height = '0px';
						  div.style.padding = '0px';
						  div.style.margin = '0px';
						  div.style.border = '0px';
						  div.style.overflow = 'hidden';
						  node.parentNode.insertBefore(div, secondNode);
						  remainSpace = chrome_comp.getComputedStyle(div).width;  //the leaving space of containner
						if(parseInt(thirdNodeWidthStyle) <= parseInt(remainSpace)) 
							this.addProblem('RM8008', [secondNode]);
						node.parentNode.removeChild(div);	
					}
				}
			  }
		  }
	  }
			  
}
); // declareDetector

});
