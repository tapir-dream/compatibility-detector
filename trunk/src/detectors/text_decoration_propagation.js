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

// One detector implementation for checking that the 'text-decoration' property
// which Text decorations visible difference in browsers.
// @author: qianbaokun@gmail.com
// @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=29
//
// Because the W3C CSS 2.1 specification on the style of 'text-decoration'
// property is inheritable description is not clear.
//
// This makes the realization of different browsers may arise in specific
// differences.
// The detector checks all nodes, and do the following treatment:
// 1. Filter all text nodes, not visible nodes and the node has no parent
//    element.
// 2. Filter Quirks Mode in the 'position: absolute' and 'position: fixed'
//    elements.
// 3. Filter set is -100 the following 'top' 'left' and 'text-indent' elements.
//    Because their may display area at the outside,can't visible and
//    not display differences.
// 4. WebkitTextDecorationsInEffect property by text rendering style of the
//    current node the parent node render the existence of different styles.
// 5. If there is illustrated in the same show differences.

// =============================================
// 因为 W3C CSS 2.1 规范中对样式 'text-decoration' 属性的可继承性描述不明确,
// 这使得不同浏览器在具体实现时可能产生差异.
//
// The detector check all nodes, and do the following treatment:
// 1. 过滤所有文本节点，不可视节点和没有父元素的节点
// 2. 过滤 Quirks Mode 中的 'position:absolute' 'position:fixed' 元素
// 3. 过滤设定值为 -100 以下的 'top' 'left' 和 'text-indent' 元素，因为他们可能
// 处于可显示区域外而无法看出显示差异。
// 4. 通过 WebkitTextDecorationsInEffect 属性当前节点的文本渲染样式与父节点的
// 渲染样式是否存在不同。如果相同则说明存在显示差异。

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'text_decoration_propagation',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  if (!node.parentNode)
    return;

  var computedStyle = chrome_comp.getComputedStyle(node);
  var display = computedStyle.display;
  var threshold = -100;

  var position = computedStyle.position;
  // All browsers propagates decoration into absolute positioned block in
  // Quirks mode.
  if (position == 'absolute' || position == 'fixed') {
    if (chrome_comp.inQuirksMode())
      return;
    if ((parseInt(computedStyle.top, 10) | 0) < threshold ||
       (parseInt(computedStyle.left, 10) | 0) < threshold)
      return;
  } else if (display != 'inline-table' && display != 'inline-block') {
    return;
  }

  if ((parseInt(computedStyle.textIndent, 10) | 0) < threshold)
    return;

  if (!node.innerText)
    return;

  var parentComputedStyle = chrome_comp.getComputedStyle(node.parentNode);
  if (parentComputedStyle.WebkitTextDecorationsInEffect != 'none')
    this.addProblem('RT3002', [node]);
}
); // declareDetector

});
