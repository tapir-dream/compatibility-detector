/**
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

/**
 * @fileoverview: One detector implementation for checking 'IE lowsrc
 * attribute and empty src attribute' problems
 * @bug:https://code.google.com/p/compatibility-detector/issues/detail?id=107
 *      https://code.google.com/p/compatibility-detector/issues/detail?id=108
 *
 * HO1002: check all IMG and INPUT[type="image"] elements, if it has no "src"
 *  attribute or the value of "src" is empty, then report problem.
 *
 * BT1038: check all IMG and INPUT[type="image"] elements, if it has no "src"
 *  attribute or the value of "src" is empty, and it has "lowsrc" attribute,
 *  then report problem.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'img_empty_src_and_img_lowsrc',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {
  this.testIntegerValueRegExp = /^\s*\d+\s*$/;
},

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  if (node.tagName != 'IMG' && node.tagName != 'INPUT')
    return;

  if (node.tagName == 'INPUT' && node.getAttribute('type') != 'image')
    return;

  if (node.getAttribute('src'))
    return;

  // This is a filter, when the IMG tag set to width or height ,
  // and the width and height values is valid values,
  // then the IMG tag is probably in order to achieve images of
  // the region in the visual Lazy loading and other requirements,
  // they should not be detected.
  if (node.hasAttribute('width') || node.hasAttribute('height')) {
    if (this.testIntegerValueRegExp.test(node.getAttribute('width')) ||
        this.testIntegerValueRegExp.test(node.getAttribute('height')))
      return;
  }

  this.addProblem('HO1002', [node]);

  if (node.getAttribute('lowsrc'))
    this.addProblem('BT1038', [node]);
}
); // declareDetector

});
