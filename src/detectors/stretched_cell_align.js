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

'stretched_cell_align',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (node.tagName == 'TD') {
    var style = chrome_comp.getComputedStyle(node);
    if (style && (style.textAlign == 'center' || style.textAlign == 'right')) {
      var definedWidth =
          chrome_comp.getDefinedStylePropertyByName(node, false, 'width');
      if (definedWidth && definedWidth.indexOf('%') < 0 &&
          parseFloat(definedWidth) < parseFloat(style.width)) {
        var cloneTD = node.cloneNode(true);
        document.body.appendChild(cloneTD);
        var cloneTDWidth = chrome_comp.getComputedStyle(cloneTD).width;
        document.body.removeChild(cloneTD);
        // The cell is stretched, and it's not caused by the content's potential
        // overflow
        if (parseFloat(cloneTDWidth) < parseFloat(style.width)) {
          // We don't need to check whether the child nodes are block or inline,
          // as in IE6/IE7/IE8(Q), block elements are also be affected by
          // 'text-align' attribute, see issue type RT8003. But we don't need to
          // check whether there are non-left-float static/relative positioned
          // child.
          for (var child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType == Node.TEXT_NODE &&
                chrome_comp.trim(child.nodeValue)) {
              this.addProblem('RE8014', [node]);
              return;
            } else if (child.nodeType == Node.ELEMENT_NODE &&
                       child.offsetWidth > 0) {
              var style = chrome_comp.getComputedStyle(child);
              if (style.float != 'left' &&
                  (style.position == 'static' || style.position == 'relative')) {
                this.addProblem('RE8014', [node]);
                return;
              }
            }
          }
        }
      }
    }
  }
}
); // declareDetector

});
