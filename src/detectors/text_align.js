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

'text_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  var style = chrome_comp.getComputedStyle(node);
  var display = style.display;
  var textAlign = style.textAlign;
  var direction = style.direction;
  if ((display == 'block' || display == 'inline-block' ||
       display == 'table-cell') &&
      (textAlign == 'center' ||
       (direction == 'ltr' && textAlign == 'right') ||
       (direction == 'rtl' && textAlign == 'left'))) {
    var childMaxWidth = node.clientWidth -
        parseInt(style.paddingLeft) - parseInt(style.paddingRight);
    var child = node.firstElementChild;
    do {
      if (child) {
        var childStyle = chrome_comp.getComputedStyle(child);
        if (childStyle.display == 'block' &&
            childStyle.float == 'none' &&
            (childStyle.position == 'static' ||
             childStyle.position == 'relative')) {
          var childWidth = child.offsetWidth +
              parseInt(childStyle.marginLeft) +
              parseInt(childStyle.marginRight);
          if (childWidth + 1 < childMaxWidth) {
            this.addProblem('RT8003',
                { nodes: [node], details: childMaxWidth + 'vs' + childWidth });
            return;
          }
        }
        child = child.nextElementSibling;
      }
    } while (child && child != node.lastElementChild);
  }
}
); // declareDetector

});
