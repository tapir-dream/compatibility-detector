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

'z_index_auto',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
[train of thought]
Find elements which 'position' is not 'static' and 'z-index' is 'auto'.
Check the found element has a descendant element which 'pisition' is not 'static'.
*/
function checkNode(node, context) {
	if (node.nodeType != Node.ELEMENT_NODE) return;
	var computedStyle = chrome_comp.getComputedStyle(node);
	if (computedStyle.position != 'static' && computedStyle.zIndex == 'auto') {
		var childrenElements = node.children;
		for (var i = 0; i < childrenElements.length; i++) {
			if (chrome_comp.getComputedStyle(childrenElements[i]).position != 'static') {	//Check 'display = none' too, many menus set element's display to 'none' first.
				this.addProblem('RM8015', [node]);
				return;
			}
		}
	}
}
); // declareDetector

});
