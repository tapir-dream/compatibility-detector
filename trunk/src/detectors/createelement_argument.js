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
 * @fileoverview Check if the argument of document.createElement is HTML
 * markup.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=145
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
  // The last function which calls the createElement method. We initialize it
  // with an empty function to avoid "caller == This.lastCaller" when the method
  // is running in the global context at the first hook.
  this.lastCaller = function() {};
  // The argument for the last called createElement method.
  this.lastArgument = '';
  // The map for recording the errors, we make the argument of the method as the
  // key.
  this.errorList = {};

  this.createElementHandler = function(result, originalArguments, callStack) {
    var caller = arguments.callee.caller.caller;
    var lastCaller = This.lastCaller;
    var lastArgument = This.lastArgument
    var arg0 = (originalArguments[0] + '').trim();
    if (!arg0)
      return;
    // Mootools tries to use document.createElement('<input name=x>') to tell if
    // the current browser can accept HTML String in the createElement method.
    // So we must ignore the pages using Mootools. Refer to:
    // http://mootools.net/download/get/mootools-core-1.3.1-full-compat.js
    if (arg0 == '<input name=x>')
      return;
    // Only IE supports using a HTML markup string as argument. We just check
    // the first character after trim.
    if (arg0[0] == '<') {
      // Record the error information for postAnalyze.
      This.errorList[arg0] = {
        stack: chrome_comp.dumpStack(),
        caller: caller
      };
      // Record these values for the next hook.
      This.lastArgument = arg0;
      This.lastCaller = caller;
    } else {
      // Some pages use a buggy way such as
      // try {
      //   var a = document.createElement('<input name="aa" />'); // For IE
      // } catch(e) {
      //   var a = document.createElement('input');  // For non-IE
      //   a.setAttribute('name', 'aa');
      // }
      // to create new element. In this case, there is no compatibility issue in
      // all browsers.
      // If the caller this time is equal to the last one, it means the
      // continual called createElement methods are in the same function or
      // context. We can not report the issue in this situation, so delete this
      // error in the errorList object.
      if (caller == lastCaller) {
        delete This.errorList[lastArgument];
      }
    }
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'createElement', this.createElementHandler);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      document, 'createElement', this.createElementHandler);
},

function postAnalyze() {
  // If the script in a page throws this createElement method error, the rest of
  // scripts will not be executed. So in general the errorList object just has
  // one key.
  for (var arg in this.errorList) {
    // Some pages may modify Object.prototype and add new functions. We should
    // ignore them when iterating this.errorList.
    if (typeof this.errorList[arg] != 'object' || !this.errorList[arg].stack)
      continue;
    var stack = this.errorList[arg].stack;
    var caller = this.errorList[arg].caller;
    if (caller)
      caller = chrome_comp.ellipsize(caller.toString(), 200);
    else
      caller = 'global context';
    this.addProblem('SD9010', {
      stack: stack,
      details: 'document.createElement("' + arg + '")' + '\nError in: ' + caller
    });
  }
}
); // declareDetector

});
