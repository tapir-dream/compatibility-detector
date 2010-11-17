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

var HTMLOptionsCollection;

chrome_comp.CompDetect.declareDetector(

'select_options_add_remove_option',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var that = this;
  
  /*
   * hook select.add()
   * select.add(option, null), select.add(option, option), 
   * select.add(option, index) and select.add(option) all have compatibility problem.
   */
  this.selectAdd_ = function(result, originalArguments, callStack){
    var arg1 = originalArguments[1];
    if (originalArguments.length > 0 && _isOption(originalArguments[0])){
      var tmp = '';
      if(arg1 !== undefined)
        tmp = ', ' + (arg1 == null ? 'null' : _isOption(arg1) ? 'option' : 'index');
      that.addProblem('SD9030', {
        nodes: [this],
        details: 'select.add(option' + tmp + ')',
        needsStack: true
      });
    }
  }
  
  /*
   * hook options.add
   * options.add(option, null) and options.add(option, option) have compatibility problem.
   */
  
  this.optionsAdd_ = function(result, originalArguments, callStack){
    if (originalArguments.length > 1 && _isOption(originalArguments[0])){
      var arg1 = originalArguments[1];
      if (arg1 === null || _isOption(arg1) || _isTextNode(arg1))
        that.addProblem('SD9030', {
          nodes: [this],
          details: 'options.add(option, ' + (arg1 === null ? 'null' : 'option') + ')',
          needsStack: true
        });
    }
  }
  
  /*
   * hook options.remove()
   * options.remove(index) and options.remove(option) have compatibility problem.
   */
  this.optionsRemove_ = function(result, originalArguments, callStack){
    if (originalArguments.length > 0){
      var arg0 = originalArguments[0];
      if (parseInt(arg0) >= 0 || _isOption(arg0) || _isTextNode(arg0))
        that.addProblem('SD9030', {
          nodes: [this],
          details: 'options.remove(' + (parseInt(arg0) >= 0 ? 'index' : 'option') + ')',
          needsStack: true
        });
    }
  }
  
  function _isOption(option){
    return option instanceof HTMLOptionElement;
  }
  
  function _isTextNode(node){
    return node.nodeType === Node.TEXT_NODE;
  }
},

function setUp() {
  var select = document.createElement("select");
  HTMLOptionsCollection = select.options.constructor;
  
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.HTMLSelectElement.prototype, 'add', this.selectAdd_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      HTMLOptionsCollection.prototype, 'add', this.optionsAdd_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      HTMLOptionsCollection.prototype, 'remove', this.optionsRemove_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.HTMLSelectElement.prototype, 'add', this.selectAdd_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      HTMLOptionsCollection.prototype, 'add', this.optionsAdd_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      HTMLOptionsCollection.prototype, 'remove', this.optionsRemove_);
}
); // declareDetector

});
