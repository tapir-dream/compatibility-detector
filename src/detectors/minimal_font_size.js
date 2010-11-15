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

'minimal_font_size',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;

  if (!this.minimalFontSize_) {
    var span = document.createElement('span');
    span.setAttribute('style', 'font-size: 1px');
    this.rootNode_.appendChild(span);
    var style = window.getComputedStyle(span, '');
    this.minimalFontSize_ = style.fontSize;
    this.rootNode_.removeChild(span);
  }

  if (!this.minimalFontSize_ || this.minimalFontSize_ == '1px')
    return;

  var problem;
  if (node.tagName == 'FONT') {
    var size = node.getAttribute('size');
    if (!size)
      return;
    problem = '&lt;font size="' + size + '"&gt;';
  } else {
    var fontSize = chrome_comp.getDefinedStylePropertyByName(node, false,
        'font-size');
    if (!fontSize)
      return;
    problem = 'font-size: ' + fontSize;
  }

  if (getComputedStyle(node, '').fontSize != this.minimalFontSize_)
    return;

  var span = document.createElement('span');
  span.setAttribute('style', 'font-size: 105%');
  node.appendChild(span);
  if (getComputedStyle(span, '').fontSize == this.minimalFontSize_) {
    this.addProblem('BW3006', { nodes: [node], details: problem });
  }
  node.removeChild(span);
}
); // declareDetector

});
