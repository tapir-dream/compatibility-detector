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

'getelementsbyname_case_sensitive',

chrome_comp.CompDetect.NonScanDomBaseDetector,

/*
 * step of reporting problem:
 * 1. Listen document.getElementsByName method, when it's called and get no result:
 *   1.1 The element with name attribute:
 *     1.1.1 attribute value toLowerCase() equals to argument of getElementsByName toLowerCase()
 */

function constructor(rootNode) {
  var that = this;

  this.getElementsByNameHandle_ = function(result, originalArguments, callStack) {
    if(result.length == 0){
      var elements = document.querySelectorAll("[name]"),
          name = originalArguments[0].toLowerCase();
      Array.prototype.forEach.call(elements, function(element){
        if(element.getAttribute("name").toLowerCase() == name){
          that.addProblem('SD9012', {
            nodes: [this],
            details: "document.getElementsByName(" + originalArguments[0] + ")",
            needsStack: true
          });
          return;
        }
      });
    }
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      Document.prototype, 'getElementsByName', this.getElementsByNameHandle_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      Document.prototype, 'getElementsByName', this.getElementsByNameHandle_);
}
); // declareDetector

});
