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

'setTimeout_setInterval',

chrome_comp.CompDetect.NonScanDomBaseDetector,



function constructor(rootNode) {
  var This = this;
  this.checkParam = function (param){
    return /\d+/.test(param)
      && param != Infinity
      && param >= 0
      && param < 2147483648 ;
  }

  this.getTimeoutHandle_ = function(result, originalArguments, callStack) {
    if (This.checkParam(originalArguments[1])) return ;
    This.addProblem('BX9011', { nodes: [this], needsStack: true });
  };

  this.getIntervalHandle_ = function(result, originalArguments, callStack) {
    if (This.checkParam(originalArguments[1])) return ;
    This.addProblem('BX9011', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window, 'setTimeout', this.getTimeoutHandle_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      window, 'setInterval', this.getIntervalHandle_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window, 'setTimeout', this.getTimeoutHandle_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window, 'setInterval', this.getIntervalHandle_);
}
); // declareDetector

});
