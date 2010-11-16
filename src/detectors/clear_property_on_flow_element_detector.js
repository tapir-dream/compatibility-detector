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

'flowElementClear',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*测试页面：http://sports.sina.com.cn/nba/live.html?id=2010110214*/
/*
 *【思路】
 *分为两种情况：
  1、前两个节点浮动方向不同，并且后一个节点清除了上一个节点方向上的浮动；
  2、存在至少三个节点，并且前两个节点的浮动方向相同，第三个浮动节点没有清除该方向上的浮动
 *
 *【messages.json】
 * "RM8008": { "message": "IE6 IE7 IE8(Q) 中对浮动元素上 'clear' 特性的解释出现错误，使其自身位置和其后浮动元素的位置与其他浏览器中不同"},
 * "RM8008_suggestion": { "message": "不要将 'clear' 特性应用在浮动元素上，以免出现上述不兼容的问题。" },
 *
 */
function checkNode(node, additionalData) {
	
  if (Node.ELEMENT_NODE != node.nodeType)
    return;
  var continuousNodeCount =1;	//记录连续节点的个数
  //获得第一个（当前）节点CSS特性值
  var firstNodeDisplayStyle = chrome_comp.getComputedStyle(node).display;
  var firstNodeFloatStyle = chrome_comp.getComputedStyle(node).float;
  //获得第二个节点的CSS特性值
  if(node.nextElementSibling){
	  var secondNode = node.nextElementSibling;
	  var secondNodeDisplayStyle = chrome_comp.getComputedStyle(secondNode).display;
	  var secondNodeClearStyle = chrome_comp.getComputedStyle(secondNode).clear;
	  var secondNodeFloatStyle = chrome_comp.getComputedStyle(secondNode).float;
	  continuousNodeCount++;
  }
  else             //不存在第二个节点则退出
    return;
  //获得第三个节点的CSS特性值
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
  //判断是否为空的浮动元素及是否可见(占据空间,visibility:hidden 也占据空间)
	  if(secondNode.offsetHeight!='0' && secondNode.offsetWidth!='0' && secondNodeFloatStyle!='none' && secondNodeDisplayStyle!='none'){
		  if(continuousNodeCount >= 2){  //至少存在2个连续节点
			 if(firstNodeFloatStyle != secondNodeFloatStyle){   //前后节点浮动方向不同
				if(secondNodeClearStyle == firstNodeFloatStyle || secondNodeClearStyle == 'both' || secondNodeClearStyle =='all')  //第二个节点清除了上个节点同方向上的浮动
					this.addProblem('RM8008', [secondNode]);
			  }
		 	 if(firstNodeFloatStyle == secondNodeFloatStyle && continuousNodeCount == 3 && thirdNodeFloatStyle!='none' ){ 
				  //存在3个连续节点，前后节点浮动方向相同,并且第三个节点为浮动元素
				if(secondNodeClearStyle == firstNodeFloatStyle || secondNodeClearStyle == 'both' || secondNodeClearStyle =='all'){  //第二个节点清除了上个节点同方向上的浮动
					if(thirdNodeFloatStyle == firstNodeFloatStyle && (thirdNodeClearStyle == firstNodeFloatStyle || thirdNodeClearStyle == 'both' || thirdNodeClearStyle                        =='all')){
							//第三个节点与前两个节点的浮动方向相同，并且清除了该方向的浮动（此时无浏览器差异）
						}
					else{
						  var div = document.createElement('div');
						  div.style.height = '0px';
						  div.style.padding = '0px';
						  div.style.margin = '0px';
						  div.style.border = '0px';
						  div.style.overflow = 'hidden';
						  node.parentNode.insertBefore(div, secondNode);
						  remainSpace = chrome_comp.getComputedStyle(div).width;  //包含块框剩余宽度
                          //node.parentNode.removeChild(div);
						if(parseInt(thirdNodeWidthStyle) <= parseInt(remainSpace)) //当第三个节点的宽度小于等于第一个节点所在行所剩宽度
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
