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

'z_index_auto_detector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
【思路】
找到 position 非 static 并且 z-index 为 auto 的元素。
检查此元素内是否还有其他 position 非 static 的元素。
如果有则报错。

【遇到的问题】
对于有些报错的情况，在没有其他定位元素与检测到的元素有重叠关系时，并无表现上的差异。

*/
function checkNode(node, additionalData) {
	if (node.nodeType != Node.ELEMENT_NODE) return;
	var computedStyle = chrome_comp.getComputedStyle(node);
	if (computedStyle.position != 'static' && computedStyle.zIndex == 'auto') {
		var childrenElements = node.children;
		for (var i = 0; i < childrenElements.length; i++) {
			if (chrome_comp.getComputedStyle(childrenElements[i]).position != 'static') {	//display = none 也检查，多数菜单都是先 none 再 block。
				this.addProblem('RM8015', [node]);
				return;
			}
		}
	}
}
); // declareDetector

});
