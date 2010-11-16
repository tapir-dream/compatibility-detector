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

'emptyFloatLeftElementInAutoTableLayout',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
 *【思路】
 *首先查找左浮动且为空的浮动元素，然后判断其offsetParent是否为TD
 *若为TD则继续向上找到其所在行TR，并获得TR宽度，通过设置浮动元素的display特性值为none来隐藏其宽度，
 *最后比较隐藏浮动元素前后TR元素的宽度变化，若TR的宽度发生了变化，则证明该浮动元素参与了TR的宽度计算
 *【messages.json】
 * "RE8004": { "message": "IE6 IE7 IE8(Q) 中自动布局的表格在其中包含无内容的左浮动元素时的宽度计算在某些情况下有误"},
 * "RE8004_suggestion": { "message": "避免在 TD 元素内出现左浮动、内容为空的元素。" },
 *
 */
function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  //获得TR的宽度值
  function getTrWidth(td){   
  	if(td.parentNode ){
	  	if(td.parentNode.tagName == 'TR')
			return chrome_comp.getComputedStyle(td.parentNode).width
		else{
			if(td.parentNode.tagName == 'BODY')
				return false;
			else	
				getTrWidth(td.parentNode);
		}
	}
	else
		return  false;
 }
  
  var nodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  var nodeWidthStyle = chrome_comp.getComputedStyle(node).width;
  var offsetParent = node.offsetParent;
  /*====*/
 if (nodeFloatStyle == 'left' && nodeWidthStyle!=0 && node.childNodes.length == 0){
	 	if (offsetParent && offsetParent.tagName == 'TD'){
			var trOriginalWidth = getTrWidth(offsetParent);
			if(trOriginalWidth){
			originalDisplay = node.style.display;
			node.style.display = 'none !important';
			trChangedWidth = getTrWidth(offsetParent); //获得去掉浮动元素后TR的宽度
			if (trOriginalWidth!=trChangedWidth)
				this.addProblem('RE8004', [node]);
			node.style.display = originalDisplay ? originalDisplay : null;
			}
 		}
			  
	}
}
						   
); // declareDetector

});
