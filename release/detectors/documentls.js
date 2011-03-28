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
 * @fileoverview: Check the load method of the Document object created by the
 * createDocument method of the DOMImplementation object.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=123
 * 
 * Chrome supports to use document.implementation.createDocument to create a
 * DOMImplementation object associated with the current document, its returned
 * value is a Document object, but this object does not have the load method
 * which is described in the W3C deprecated Working Draft (refer to
 * http://www.w3.org/TR/2003/WD-DOM-Level-3-LS-20030619/load-save.html
 * #LS-DocumentLS).
 * First Hook the existing createDocument method of the
 * DOMImplementation.prototype object, second, hook the load property of the
 * Document.prototype in its handler, and report the issue in the second
 * handler.
 */


addScriptToInject(function() {

// The flag for the load method hook.
var documentHooked = false;

chrome_comp.CompDetect.declareDetector(

'documentls',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.createDocumentHandler_ = function(result, originalArguments, callStack) {
    // To avoid hooking repeatedly.
    if (!documentHooked) {
      // Use registerSimplePropertyHook because the load method of the Document
      // object is not a exist method, so we use the property hook which can
      // hook its execution too.
      chrome_comp.CompDetect.registerSimplePropertyHook(
          Document.prototype, 'load', This.loadHandler_);
    }
  };
  this.loadHandler_ = function(oldValue, newValue, reason) {
    documentHooked = true;
    This.addProblem('SD9008', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      DOMImplementation.prototype, 'createDocument',
      this.createDocumentHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      DOMImplementation.prototype, 'createDocument',
      this.createDocumentHandler_);
  if (documentHooked) {
    chrome_comp.CompDetect.unregisterSimplePropertyHook(
        Document.prototype, 'load', this.loadHandler_);
    documentHooked = false;
  }
}
); // declareDetector

});
