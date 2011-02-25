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
 * @fileoverview: Check if the argument of document.createElement is HTML
 *                markup.
 * @bug: https://code.google.com/p/compatibility-detector/issues/detail?id=145
 * 
 * Hook the existing createElement method of the document object, and get its
 * original argument string, check whether the string starts with the less than
 * character (<).
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'createelement_argument',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.createElement_ = function(result, originalArguments, callStack) {
    var arg0 = (originalArguments[0] + '').trim();
    if (!arg0)
      return;
    // Only IE supports using a HTML markup string as argument. We just check
    // the first character after trim.
    if (arg0[0] == '<')
      This.addProblem('SD9010', {
        nodes: [this],
        details: 'createElement(' + arg0 + ')',
        needsStack: true
      });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'createElement', this.createElement_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      document, 'createElement', this.createElement_);
}
); // declareDetector

});
