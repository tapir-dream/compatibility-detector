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
/*
 *【思路】
 *分为两种情况：
 *检测是否存在两个相邻的浮动元素且浮动方向相同，如果前一个浮动元素高度为零且其所在行能够容纳下第二个浮动元素，则产生此问题。
 *【messages.json】
 * "RM8008": { "message": "IE6 IE7 IE8(Q) 中零高度的浮动元素会阻挡其兄弟浮动元素"},
 * "RM8008_suggestion": { "message": "如果希望一个浮动元素能阻挡与其向相同方向浮动的兄弟元素，请确保其高度不为零，以使页面布局在各浏览器中的表现一致。
    反之，如果不希望零高度的浮动元素阻挡其兄弟浮动元素，请隐藏该元素，如使用 'display:none'。但要注意，这样做也会使其可能存在的绝对定位的内容也不可见。" },
 *
 */
function checkNode(node, additionalData) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  //获得当前节点CSS特性值	
  var nodeDisplayStyle = chrome_comp.getComputedStyle(node).display;
  var nodeClearStyle = chrome_comp.getComputedStyle(node).clear;
  var nodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  //获得下一个节点的CSS特性值
  if(node.nextElementSibling){
  var nextNode = node.nextElementSibling;
  var nextNodeDisplayStyle = chrome_comp.getComputedStyle(nextNode).display;
  var nextNodeClearStyle = chrome_comp.getComputedStyle(nextNode).clear;
  var nextNodeFloatStyle = chrome_comp.getComputedStyle(nextNode).float;
  var nextNodeWidthStyle = chrome_comp.getComputedStyle(nextNode).width;
  }
  else
  	return;
  /*====*/
  if(node.offsetHeight == '0' && node.offsetWidth!='0' && nodeFloatStyle!='none' && nodeDisplayStyle!='none')  
  //判断是否为零高度的浮动元素及是否可见(占据空间)
	  if(nextNode.offsetHeight!='0' && nextNode.offsetWidth!='0' && nextNodeFloatStyle!='none' && nextNodeDisplayStyle!='none')
		  if(nodeFloatStyle == nextNodeFloatStyle){ //前后节点浮动方向是否相同
				if(nextNodeClearStyle!=nodeFloatStyle && nextNodeClearStyle!='both' && nextNodeClearStyle!='all'){  //判断下一个节点是否清除了该方向上的浮动
					var div = document.createElement('div');
					div.style.height = '0px';
					div.style.padding = '0px';
					div.style.margin = '0px';
					div.style.border = '0px';
					div.style.overflow = 'hidden';
					node.style.height='1px';         //将零高度浮动元素高度设为1
					node.parentNode.insertBefore(div, nextNode);
					remainSpace = chrome_comp.getComputedStyle(div).width;  //包含块框剩余宽度
					if(parseInt(nextNodeWidthStyle) <= parseInt(remainSpace))
						this.addProblem('RM1004', [node]);
				}
				node.style.height='0px';
				node.parentNode.removeChild(div);
		  }
			  
}
); // declareDetector

});
