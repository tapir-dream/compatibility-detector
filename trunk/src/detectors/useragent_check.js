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

// ************************** userAgentDetector implementation*****************
// @author : jnd@chromium.org
// Gleen want to have a detector for user-agent string checking.  This detector
// would look for:
// 1. Any use of navigator.userAgent.indexOf() or regular expression that looks
//    for 'Apple', 'Safari', 'Google', 'Chrome', etc. (websites should be
//    looking for 'WebKit')
// 2. Any use of navigator.vendor.indexOf() or regular expression that looks
//     for 'Apple' or 'Google' (websites shouldn't be looking at
//     navigator.vendor to determine which browser is used)
//

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'useragent_check',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  this.patterns_ = {
    companyName : /Apple|Google/ig,
    browserBrand : /Safari|Chrome|Firefox/ig
  };

  function checkUserAgent(result, originalThisContext, originalArguments,
                          callStack) {
    if (this.hasProblem_)
      return;

    if (typeof originalThisContext != 'string')
      return;

    var orginalString = originalThisContext;
    var searchString = originalArguments[0];

    if (typeof searchString != 'string')
      return;
    if (!orginalString.length || !searchString.length)
      return;
    if (orginalString != this.window_.navigator.userAgent &&
        orginalString != this.window_.navigator.vendor)
      return;
    for (var pattern in this.patterns_) {
      if (this.patterns_[pattern].test(searchString)) {
        this.addProblem('BX9034');
        this.patterns_[pattern].test('');
        this.cleanUp();
        return;
      }
    }
  }

  var This = this;
  this.checkUserAgent_ = function(result, originalArguments, callStack) {
    checkUserAgent.call(This, result, this, originalArguments, callStack);
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.String.prototype, 'indexOf', this.checkUserAgent_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.String.prototype, 'indexOf', this.checkUserAgent_);
}
); // declareDetector

});
