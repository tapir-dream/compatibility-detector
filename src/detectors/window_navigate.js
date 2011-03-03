/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Check use window.navigate method control page redirects.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=100
 *
 * window.navigate can loads the specified URL to the current window in IE
 * and Opera, but other browsers(Chrome, Firefox, Safari) do not support it.
 * Refer to: http://msdn.microsoft.com/en-us/library/ms536638(v=VS.85).aspx
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'window_navigate',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.navigateHookHandler_ = function(result, originalArguments, callStack) {
    This.addProblem('BX9052', { nodes : [this], needsStack : true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      window, 'navigate', this.navigateHookHandler_);

},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      window, 'navigate', this.navigateHookHandler_);
}
); // declareDetector

});
