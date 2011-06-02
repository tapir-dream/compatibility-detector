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
 * @fileoverview Check the compatibility issues when adding or removing the
 * OPTION elements from the SELECT element.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=42
 *
 * We can add or remove the SELECT element's options by using select.add(),
 * select.remove(), select.options.add() or select.options.remove(). And some
 * methods have the compatibility issue, these may throw errors.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'select_options_add_remove_option',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;

  this.isHTMLOptionElement = function(element) {
    return element instanceof HTMLOptionElement;
  }

  this.getSelectElementByOptionCollection = function(collection) {
    var select = null;
    if (collection.length < 1) {
      var option = new Option('inserted', 'inserted');
      collection.add(option);
      select = collection[0].parentElement;
      collection.remove(option);
    } else {
      select = collection[0].parentElement;
    }
    return select;
  }

  /*
   * Hook select.add() method, the followings situations will have the
   * compatibility issue.;
   * select.add(option, index)
   * select.add(option)
   */
  this.selectAddHandler = function(result, originalArguments, callStack) {
    var arg0 = originalArguments[0];
    var arg1 = originalArguments[1];
    if (originalArguments.length < 1 || !This.isHTMLOptionElement(arg0))
      return result;
    // Some non-IE browsers do not support missing second argument or the
    // second argument's value is a number.
    if (arg1 == 0 || arg1 | 0 == arg1 || arg1 === undefined) {
      This.addProblem('SD9030', {
        nodes: [this],
        needsStack: true
      });
    }
  }

  /*
   * Hook options.add() method, the following situations will have the
   * compatibility issue:
   * options.add(option, null)
   * options.add(option, option)
   */
  this.optionsAddHandler = function(result, originalArguments, callStack) {
    var arg0 = originalArguments[0];
    var arg1 = originalArguments[1];
    if (originalArguments.length < 1 || !This.isHTMLOptionElement(arg0))
      return result;
    // Only in IE8(S) and Opera, the second argument can be an HTMLOptionElement
    // object. In Firefox, Chrome and Safari, The new option will be inserted
    // into the head of the list when the second argument is null.
    if (arg1 === null || This.isHTMLOptionElement(arg1)) {
      This.addProblem('SD9030', {
        nodes: [This.getSelectElementByOptionCollection(this)],
        needsStack: true
      });
    }
  }
},

function setUp() {
  // We cannot get the HTMLOptionCollection directly, so we need to create an
  // HTMLSelectElement object temporarily to cache it.
  this.HTMLOptionsCollection =
      document.createElement('select').options.constructor;
  // Check the method called by the HTMLSelectElement object.
  chrome_comp.CompDetect.registerExistingMethodHook(
      HTMLSelectElement.prototype, 'add', this.selectAddHandler);
  // Check the method called by the HTMLOptionCollection object.
  chrome_comp.CompDetect.registerExistingMethodHook(
      this.HTMLOptionsCollection.prototype, 'add', this.optionsAddHandler);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      HTMLSelectElement.prototype, 'add', this.selectAddHandler);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      this.HTMLOptionsCollection.prototype, 'add', this.optionsAddHandler);
}
); // declareDetector

});
