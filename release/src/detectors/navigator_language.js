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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'navigator_language',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  // Index into the array:
  // 0: navigator.language,
  // 1: navigator.userLanguage or browserLanguage or systemLanguage,
  // (not used for now) 2: String.toLowerCase or String.toUpperCase.
  this.callStacks_ = [];
  this.lastCaller_ = null;
  this.onCalled_ = function(id) {
    var caller = arguments.callee.caller.caller.caller;
    if (caller == this.lastCaller_) {
      // Only record the first occurrence in one function.
      if (this.callStacks_[id])
        return;
    } else {
      this.checkUnpairedGetterCalls_();
      this.lastCaller_ = caller;
    }
    var stack = chrome_comp.dumpStack();
    if (!chrome_comp.isCalledFromExtension(stack))
      this.callStacks_[id] = stack;
  };

  this.checkUnpairedGetterCalls_ = function() {
    if (!this.callStacks_[0] && this.callStacks_[1])
      // navigator.[xxxx]Language without navigator.language or
      // String.to(Lower|Upper)Case.
      this.addProblem('BX2040', { stack: this.callStacks_[1] });

    // Don't report when only navigator.language is called, because
    // navigator.language || navigator.userLanguage is valid but
    // navigator.userLanguage won't be called.
    this.callStacks_ = [];
  };
},

function setUp() {
  var This = this;
  var originalNavigatorLanguage = navigator.language;
  chrome_comp.CompDetect.registerSimplePropertyHook(navigator, 'language',
      function(oldValue, newValue, reason) {
        if (reason == 'get')
          This.onCalled_(0);
        return originalNavigatorLanguage;
      });

  this.otherLanguagePropertyHandler_ = function(oldValue, newValue, reason) {
    if (reason == 'get')
      This.onCalled_(1);
    return newValue;
  };
  chrome_comp.CompDetect.registerSimplePropertyHook(navigator,
      'userLanguage', this.otherLanguagePropertyHandler_);
  chrome_comp.CompDetect.registerSimplePropertyHook(navigator,
      'browserLanguage', this.otherLanguagePropertyHandler_);
  chrome_comp.CompDetect.registerSimplePropertyHook(navigator,
      'systemLanguage', this.otherLanguagePropertyHandler_);

  this.stringCaseHook_ = function() {
    This.onCalled_(2);
  };

  // Disabled for now.
  // chrome_comp.CompDetect.registerExistingMethodHook(String.prototype,
  //     'toLowerCase', this.stringCaseHook_);
  // chrome_comp.CompDetect.registerExistingMethodHook(String.prototype,
  //     'toUpperCase', this.stringCaseHook_);
},

function cleanUp() {
  // Don't unregister 'language' handler otherwise navigator.language will be
  // broken.
  chrome_comp.CompDetect.unregisterSimplePropertyHook(navigator,
      'userLanguage', this.otherLanguagePropertyhandler_);
  chrome_comp.CompDetect.unregisterSimplePropertyHook(navigator,
      'browserLanguage', this.otherLanguagePropertyhandler_);
  chrome_comp.CompDetect.unregisterSimplePropertyHook(navigator,
      'systemLanguage', this.otherLanguagePropertyhandler_);

  // Disabled for now.
  // chrome_comp.CompDetect.unregisterExistingPropertyHook(String.prototype,
  //     'toLowerCase', this.stringCaseHook_);
  // chrome_comp.CompDetect.unregisterExistingPropertyHook(String.prototype,
  //     'toUpperCase', this.stringCaseHook_);
  this.stringCaseHook_ = null;
},

function postAnalyze() {
  this.checkUnpairedGetterCalls_();
  this.lastCaller_ = null;
}
); // declareDetector

});
