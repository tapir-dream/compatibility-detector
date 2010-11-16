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
/*
 *【思路】
 *判断包含块中向右浮动或者向左浮动并且文本方向为rtl时，浮动元素的宽度是否大于包含块的宽度
 *【messages.json】
 * "RM8008": { "message": "IE6 IE7 IE8(Q) 中某些情况下浮动元素会在其浮动方向溢出其包含块"},
 * "RM8008_suggestion": { "message": "当文字方向为 'ltr' 时应避免使右浮动元素的宽度超出其包含块的宽度。同样地，当文字方向为 'rtl' 时应避免使左浮动元素的宽度超出其包含块的宽度。" },
 *
 */
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
  /*====*/
  if (node.offsetHeight && node.offsetWidth){
		containerWidth = chrome_comp.getComputedStyle(chrome_comp.getContainingBlock(node)).width;    //包含块宽度
		if(parseInt(nodeWidthStyle) > parseInt(containerWidth)){ 		//包含块宽度与浮动元素宽度进行比较	   
			if ((nodeFloatStyle == 'right' && nodeDirectionStyle== 'ltr') || (nodeFloatStyle == 'left' && nodeDirectionStyle== 'rtl'))//向右浮动或者向左浮动并且文本方向为rtl
				this.addProblem('RM8014', [node]);
		}
	}			  
}
); // declareDetector

});
