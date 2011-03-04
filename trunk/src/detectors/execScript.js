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
 * @fileoverview Check whether the second argument of window.execScript is
 * valid.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=102
 * WontFix
 *
 * window.execScript can execute non-javascript in IE, but not in Chrome.
 * Other browsers do not support it. We just check whether the second argument
 * contains 'javascript' string.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'execscript',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(){
  var This = this;
  this.execScriptHandler_ = function(result, originalArguments, callStack) {
    if (originalArguments.length < 2)
      return;
    var arg1 = originalArguments[1] + '';
    if (arg1.toLowerCase().indexOf('javascript') == -1)
      This.addProblem('BX9055');
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window, 'execScript', this.execScriptHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window, 'execScript', this.execScriptHandler_);
}
); // declareDetector

});