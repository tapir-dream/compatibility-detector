/*
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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'window_onerror',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
},

function setUp() {
  var This = this;
  var originalWindowOnerror = window.onerror;
  chrome_comp.CompDetect.registerSimplePropertyHook(window, 'onerror',
    function(oldValue, newValue, reason) {
      var func = newValue.toString().replace(/alert/gi, '');
      if (new Function('return ' + func + '()')());
        This.addProblem('SD2020', [document.documentElement]);
      return originalWindowOnerror;
    });
},
function cleanUp() {}
); // declareDetector

});
