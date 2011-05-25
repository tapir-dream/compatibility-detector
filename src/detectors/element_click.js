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
 * @fileoverview Check if the HTMLElementObjects attempt to call the 'click'
 * method.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=59
 *
 * The 'click' method for the INPUT elements whose type has one of the following
 * value: "button", "checkbox", "radio", "reset", "submit" simulate a mouse
 * click, this is the description in W3C DOM specification, and in reality,
 * The BUTTON elements and all types of the INPUT elements have the 'click'
 * method in all browsers. But the other elements do not have this method in
 * Firefox, Chrome and Safari, so if these elements attempt to call the 'click'
 * method, there will throw an error.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'element_click',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  // Some JavaScript libraries may add the click method to the prototype of the
  // DOM object of the HTML Element, to avoid the False-Positive, we hook the
  // prototype of Node. If there is click method called and its constructor's
  // prototype has not been added the click method (no Prototype library), the
  // callback below will be triggered.
  Node.prototype.click = function() {
    This.addProblem('SD9025', {
      nodes: [this],
      details: 'No such method: ' + this.tagName + '.click().'
    });
    throw 'TypeError: Object # has no method \'click\'';
  }
}
); // declareDetector

});
