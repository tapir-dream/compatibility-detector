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

'associating_map_only_by_id_attribute',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有 IMG 元素，若为设定 usemap 属性则退出，若设定了 usemap 则得到其井号后的字符串 A
 * 使用 querySelector 分别遍历出 MAP 元素 id 及 name 属性为字符串 A 的对象 B 和 对象 C
 * 若 B 为空，或者 B 与 C 为同一对象则退出，否则发出警告
 *
 *【messages.json】
 * "HO9008": { "message": "IE Opera 中可以通过 MAP 元素的 id 属性与 IMG 元素相关联" },
 * "HO9008_suggestion": { "message": "若需要 IMG 元素与 MAP 元素相关联，注意通过 IMG 元素的 usemap 属性关联的 MAP 元素的 name 属性的值。" },
 */

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'IMG')
    return;

  if (!node.hasAttribute('usemap'))
    return;
  var usemap = node.getAttribute('usemap').substring(1);
  var mapid = document.querySelector('MAP[id=' + usemap + ']');
  var mapname = document.querySelector('MAP[name=' + usemap + ']');

  if (!mapid)
    return;
  if (mapid === mapname)
    return;
  this.addProblem('HO9008', [node]);
}
); // declareDetector

});

