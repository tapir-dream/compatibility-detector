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

'right_floats_stretch_parent_elements_detector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor
/*
【思路】
找到右浮动元素（暂不考虑 direction:rtl 的情况）。
顺次向上检查其父元素，直到遇到明确定义宽度的元素或 BODY 或表格元素（将表格元素认定为已明确设定宽度的元素）为止。
在上述元素中再从外向内找到宽度为 shrink-to-fit 的，检查该元素的可用横向空间是否更大。
如果更大，则可以报告。否则不报。不再继续检测（目前尚未想到需要继续向内检测的案例）。

【遇到的问题】
getDefinedStylePropertyByName 的问题：
	!important 的判定失误。
	UA/跨域的情况无法取值。
	属性换算成的样式无法获取，如 TABLE width=xxx/DIV align=xxx。
*/
function checkNode(node, additionalData) {
	function isTableElement(node) {
		var TABLELIKE_VALUES = ['table','inline-table','table-row-group','table-header-group','table-footer-group','table-row','table-column-group','table-column','table-cell','table-caption'];
		var display = chrome_comp.getComputedStyle(node).display;
		return TABLELIKE_VALUES.indexOf(display) != -1;
	}
	function widthIsAuto(node) {
		var computedStyle = getComputedStyle(node);
		var oWidth = computedStyle.width;
		var oInlineWidth = node.style.width;
		node.style.width = 'auto !important';
		var cWidth = computedStyle.width;
		node.style.width = '';		//!important bug.
		node.style.width = oInlineWidth;
		if (!node.style.cssText) node.removeAttribute('style');	//for test.
		if (cWidth == oWidth) {		//auto width like.
			return true;
//			console.log(oWidth,cWidth);
//			var oBorderLeftWidth = computedStyle.borderLeftWidth;
//			var oInlineBorderLeftWidth = node.style.borderLeftWidth;
//			node.style.borderLeftWidth = '5px !important';
//			cWidth = computedStyle.width;
		}
		return false;
	}
	function widthIsShrinkToFit(node) {	//仅本页内有效，如果提取出去，还需考虑表格和 BUTTON 元素。
		var computedStyle = chrome_comp.getComputedStyle(node);
		return widthIsAuto(node) && computedStyle.display != 'none' && (
			((computedStyle.position == 'absolute' || computedStyle.position == 'fixed') && (computedStyle.left == 'auto' || computedStyle.right == 'auto')) ||
			computedStyle.float != 'none' ||
			computedStyle.display == 'inline-block'
		);
	}

	if (node.nodeType != Node.ELEMENT_NODE) return;
	var computedStyle = chrome_comp.getComputedStyle(node);
	if (computedStyle.float == 'right' && computedStyle.position != 'absolute' && computedStyle.position != 'fixed' && computedStyle.display != 'none') {
		var ancestorElements = [];
		var parentElement = node;
		while ((parentElement = parentElement.parentElement) && widthIsAuto(parentElement) && !isTableElement(parentElement) && parentElement.tagName != "BUTTON" && parentElement.tagName != "BODY") {
			ancestorElements.push(parentElement);
		}
		for (var i = ancestorElements.length; i; i--) {
			var ancestorElement = ancestorElements[i-1];
			if (widthIsShrinkToFit(ancestorElement)) {
				var rulerElement = document.createElement('div');
				rulerElement.style.cssText = 'display: block !important; position: static !important; float: none !important; width: auto !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: 0 none !important;';
				ancestorElement.parentNode.insertBefore(rulerElement, ancestorElement);
				var availableWidth = rulerElement.offsetWidth;
				ancestorElement.parentNode.removeChild(rulerElement);
				var computedStyle = chrome_comp.getComputedStyle(node);
				if (availableWidth > ancestorElement.offsetWidth + parseInt(computedStyle.marginLeft, 10) + parseInt(computedStyle.marginRight, 10)) {
					this.addProblem('RD8006', [node]);
				}
				break;
			}
		}
	}
}
); // declareDetector

});
