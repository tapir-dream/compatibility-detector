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

'clonenode_script',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.cloneNode_ = function(result, originalArguments, callStack) {
    if (this.tagName == 'SCRIPT' && !this.hasAttribute('src')) {
      var script = this.textContent;
      if (/^\s*$/g.test(script))
        return;
      This.addProblem('SD9029', [this]);
    } else {
      var scripts = this.getElementsByTagName('script');
      if (scripts.length < 1)
        return;
      for (var i = 0, j = scripts.length; i < j; i++) {
        if (!scripts[i].hasAttribute('src')) {
          var script = scripts[i].textContent;
          if (/^\s*$/g.test(script))
            return;
          This.addProblem('SD9029', [scripts[i]]);
        }
      }
    }
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      Node.prototype, 'cloneNode', this.cloneNode_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      Node.prototype, 'cloneNode', this.cloneNode_);
}
); // declareDetector

});
