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

// ************** Detector for scrollTop and scrollLeft ***********************
// This detector is used to detect whether the page uses the non-standard
// scrollTop and scrollLeft properties.
// scrollTop and scrollLeft are not included in any public standard, and have
// different behavior in different browsers.
// In IE and Firefox, document.body.scrollTop/Left works in quirk mode but not
// strict mode, while document.documentELement.scrollTop/scrollLeft works in
// strict mode but not quirk mode.
// In Webkit, only document.body.scrollTop/Left works, and it works in both
// quirk and strict mode.
// scrollTop sets or retrieves the distance between the top of the object and
// the topmost portion of the content currently visible in the window.
// scrollLeft sets or retrieves the distance between the left edge of the
// object and the leftmost portion of the content currently visible in the
// window.
// According https://bugs.webkit.org/show_bug.cgi?id=5991, Webkit only returns 0
// when using these two properties for document,documentElement.
// so may cause different behavior comparing with IE.
// For detecting these,  We define a new g/setter to get
// document.documentElement.scrollLeft/Top. If pages try to use
// scrollLeft/Top on document.documentElement, then we can catch it.
addScriptToInject(function() {

if (chrome_comp.inQuirksMode())
  return;

chrome_comp.CompDetect.declareDetector(

'scroll_top_left',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  // Index into the array: 0: docElement.scrollLeft, 1: docElement.scrollTop,
  // 2: body.scrollLeft, 3: body.scrollTop.
  this.getterCallStacks_ = [];
  this.getterResults_ = [];
  this.lastCaller_ = null;
  this.onGetterCalled_ = function(id, result) {
    var caller = arguments.callee.caller.caller.caller;
    if (caller == this.lastCaller_) {
      // Only record the first occurrence in one function.
      if (this.getterCallStacks_[id])
        return;
    } else {
      this.checkUnpairedGetterCalls_();
      this.lastCaller_ = caller;
    }

    var callerSource = caller.toString();
    if (callerSource.indexOf('jQuery') != -1)
      return;
    switch (id) {
      case 0:
        if (callerSource.indexOf('pageXOffset') != -1 ||
            callerSource.indexOf('scrollX') != -1 ||
            callerSource.indexOf('body.scrollLeft') != -1)
          return;
        break;
      case 1:
        if (callerSource.indexOf('pageYOffset') != -1 ||
            callerSource.indexOf('scrollY') != -1 ||
            callerSource.indexOf('body.scrollTop') != -1)
          return;
        break;
      case 2:
        if (callerSource.indexOf('pageXOffset') != -1 ||
            callerSource.indexOf('scrollX') != -1 ||
            callerSource.indexOf('documentElement.scrollLeft') != -1)
          return;
        break;
      case 3:
        if (callerSource.indexOf('pageYOffset') != -1 ||
            callerSource.indexOf('scrollY') != -1 ||
            callerSource.indexOf('documentElement.scrollTop') != -1)
          return;
        break;
    }

    var stack = chrome_comp.dumpStack();
    if (!chrome_comp.isCalledFromExtension(stack)) {
      this.getterCallStacks_[id] = stack;
      this.getterResults_[id] = result;
    }
  };

  this.checkUnpairedGetterCalls_ = function() {
    if (this.getterCallStacks_[0] && !this.getterCallStacks_[2])
      // docElement.scrollLeft without paired body.scrollLeft
      this.addProblem('BX9008', { stack: this.getterCallStacks_[0] });
    else if (!this.getterCallStacks_[0] && this.getterCallStacks_[2] &&
        !this.getterResults_[2])
      // body.scrollLeft without paired docElement.scrollLeft.
      // Omit the case when body.scrollLeft is not zero, because in
      // 'body.scrollLeft || docElement.scrollLeft', 'docElement.scrollLeft'
      // won't be called.
      this.addProblem('BX9008', { stack: this.getterCallStacks_[2] });
    if (this.getterCallStacks_[1] && !this.getterCallStacks_[3])
      // docElement.scrollTop without paired body.scrollTop
      this.addProblem('BX9008', { stack: this.getterCallStacks_[1] });
    else if (!this.getterCallStacks_[1] && this.getterCallStacks_[3] &&
        !this.getterResults_[3])
      // body.scrollTop without paired docElement.scrollTop.
      // Omit the case when body.scrollTop is not zero, because in
      // 'body.scrollTop || docElement.scrollTop', 'docElement.scrollTop'
      // won't be called.
      this.addProblem('BX9008', { stack: this.getterCallStacks_[3] });

    this.getterCallStacks_ = [];
    this.getterResults_ = [];
  };

  this.bodyHooksReady_ = false;
  this.setUpBodyHooks_ = function() {
    if (this.bodyHooksReady_)
      return;
    this.bodyHooksReady_ = true;
    var This = this;
    chrome_comp.CompDetect.registerSimplePropertyHook(
        document.body, 'scrollLeft',
        function(oldValue, newValue, reason) {
          if (reason == 'get') {
            var result = window.scrollX;
            This.onGetterCalled_(2, result);
            return result;
          } else {
            window.scrollTo(newValue, window.scrollY);
          }
        }, false, true);
    chrome_comp.CompDetect.registerSimplePropertyHook(
        document.body, 'scrollTop',
        function(oldValue, newValue, reason) {
          if (reason == 'get') {
            var result = window.scrollY;
            This.onGetterCalled_(3, result);
            return result;
          } else {
            window.scrollTo(window.scrollX, newValue);
          }
        }, false, true);
  };
},

function setUp() {
  var docElement = document.documentElement;
  var This = this;
  chrome_comp.CompDetect.registerSimplePropertyHook(docElement, 'scrollLeft',
      function(oldValue, newValue, reason) {
        if (reason == 'get')
          This.onGetterCalled_(0, 0);
        return 0;
      }, false, true);
  chrome_comp.CompDetect.registerSimplePropertyHook(docElement, 'scrollTop',
      function(oldValue, newValue, reason) {
        if (reason == 'get')
          This.onGetterCalled_(1, 0);
        return 0;
      }, false, true);

  if (document.body) {
    this.setUpBodyHooks_();
  } else {
    var originalGetter = document.__lookupGetter__('body');
    if (!originalGetter) {
      var body = null;
      originalGetter = function() {
        if (!body) {
          var bodies = docElement.getElementsByTagName('body');
          if (bodies)
            body = bodies[0];
        }
        return body;
      };
    }
    chrome_comp.CompDetect.registerSimplePropertyHook(document, 'body',
        function(oldValue, newValue, reason) {
          if (reason == 'get') {
            var body = originalGetter.apply(document);
            if (body)
              This.setUpBodyHooks_();
          }
          return body;
        }, true, true);
  }
},

// Don't unregister the hook handlers because otherwise some standard page
// feature will be broken.

function postAnalyze() {
  this.checkUnpairedGetterCalls_();
  this.lastCaller_ = null;
}
); // declareDetector

});
