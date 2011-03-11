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
 * @fileoverview Check if the "ThisBinding" of some DOM/BOM method has been
 * modified when invoke this method.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=151
 * 
 * The DOM/BOM methods depend on its 'ThisBinding' in Chrome (and FF / Opera /
 * Safari), but not in IE. If change these method's 'ThisBinding' and invoke
 * them, they will execute good in IE and an error (TypeError: Illegal
 * invocation) will occured in other browsers.
 * For these methods, save the default 'ThisBinding', and check 'ThisBinding'
 * when these methods be called, if they are different, we can assert the
 * 'ThisBinding' of them has been modified, and report problem.
 * About 'ThisBinding' refer to:
 * http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'native_code_this_binding',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.objectCallFrom = null;
  // For example, document.getElementById('XXX')
  // getElementById is a property of document object, its value is an internal
  // native method, so we can call it as the function.
  // Like this code (in global context):
  //   var $ = document.getElementById;
  //   var id = $('id');
  // $'s 'ThisBinding' is window(global). So when $('id') is called,
  // Here the 'ThisBinding' of the DOM method - getElementById is modified.
  this.methodHandler = function(result, originalArguments, callStack,
                                methodName, hookedObject) {
    var caller = arguments.callee.caller.caller;
    if (caller)
      caller = chrome_comp.ellipsize(caller, 200);
    else
      caller = "global context";
    if (this != hookedObject) {
      This.addProblem('SD9005', {
        details: hookedObject.constructor.name + '.' + methodName +
            ' method "ThisBinding" error in:\n' + caller + '\n[' +
            hookedObject.constructor.name + '] --> [' + this.constructor.name +
            ']',
        needStack: true
      });
    }
  };
},

function setUp() {
  // This issue usually occurs on the document object (such as
  // document.getElementById()).
  this.hookList = {
    'document': {
      object: document,
      methods: {
        'getElementById': true,
        'getElementsByTagName': true
      }
    }
  };
  for (var object in this.hookList)
    for (var method in this.hookList[object].methods)
      chrome_comp.CompDetect.registerExistingMethodHook(
          this.hookList[object].object, method, this.methodHandler);
},

function cleanUp() {
  for (var object in this.hookList)
    for (var method in this.hookList[object].methods)
      chrome_comp.CompDetect.unregisterExistingMethodHook(
          this.hookList[object].object, method, this.methodHandler);
}
); // declareDetector

});
