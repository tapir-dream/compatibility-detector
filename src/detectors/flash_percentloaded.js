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

'flash_percentloaded',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.PercentLoaded_ = function(result, originalArguments, callStack) {
    This.addProblem('BT9037', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      HTMLObjectElement.prototype, 'PercentLoaded', this.PercentLoaded_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      HTMLObjectElement.prototype, 'PercentLoaded', this.PercentLoaded_);
}
); // declareDetector

});
