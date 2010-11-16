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

'emptyTableElementDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
加入了对空tr 空THEAD 空TBODY 空TFOOT 及有 空caption（此时无差异） 的检测
Bugzilla 测试页面：http://military.people.com.cn/GB/index.html 问题19；
*/
/*
 *【思路】
 *判断是否含有 td th caption 节点
 *
 *【messages.json】
 * "RM8008": { "message": "IE6 IE7 IE8(Q) 中空 TABLE 的宽度和高度均为0"},
 * "RM8008_suggestion": { "message": "避免出现空 TABLE ，保证各浏览器兼容。" },
 *
 */
function checkNode(node, additionalData) {
	 
  if (Node.ELEMENT_NODE != node.nodeType ||
      Node.ELEMENT_NODE != node.parentNode.nodeType ||
      node.tagName != 'TABLE')
		return;
  if (node.tagName =='TABLE'&&(node.offsetWidth!='0' || node.offsetHeight!='0')){       
	 if (node.children.length=='0')               //空 TABLE
	 	this.addProblem('RE1016', [node]);
  	else {
		  var tdList = node.getElementsByTagName('td');   //不存在 td 或 th
		  var thList = node.getElementsByTagName('th');
		  var captionList=node.getElementsByTagName('caption');
		  if (tdList.length <= 0 && thList.length <= 0 && captionList.length <= 0) //空的 caption 会使表格在 IE 中显示
		  		this.addProblem('RE1016', [node]);
	  }	
  }
   
}
); // declareDetector

});