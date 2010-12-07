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

'getelementbyid_and_getelementsbyname',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var that = this;
  var ids;
  var commonNames;
  var namesOfEmbed;
  var namesOfFrameAndParam;

  this.getElementById_ = function(result, originalArguments, callStack) {
    var arg0 = originalArguments[0];
    var lowerCaseArg0 = arg0.toLowerCase();
    var lowerCaseIds = getIds();

    //handle SD9002
    if (!result && lowerCaseIds.indexOf(lowerCaseArg0) >= 0) {
      addProblem('SD9002');
    }

    //handle SD9001, document.getElementById(case-sensitive name)
    //still works in IE67Q
    var names = getNames();
    if (!result && names.commonNames.concat(names.namesOfEmbed)
        .indexOf(lowerCaseArg0) >= 0) {
      //caller is null when call document.getElementById() in window scope
      var caller = arguments.callee.caller.caller;
      //filter jQuery
      if (!(caller && caller.caller && /jQuery/.test(caller.caller.caller)))
        addProblem('SD9001');
    }

    function addProblem(id){
      that.addProblem(id, {
        nodes: [this],
        details: 'document.getElementById(' + arg0 + ')',
        needsStack: true,
        severityLevel: 3
      });
    }
  };

  //handle SD9012
  this.getElementsByName_ = function(result, originalArguments, callStack) {
    var arg0 = originalArguments[0];
    var names = getNames();

    if (result.length == 0 && names.commonNames
        .concat(names.namesOfFrameAndParam).indexOf(arg0.toLowerCase()) >= 0){
      that.addProblem('SD9012', {
        nodes: [this],
        details: 'document.getElementsByName(' + arg0 + ')',
        needsStack: true
     });
    }
  };

  //may has problem when updating document tree dynamically after window loading
  //get all elements with id attribute in the document
  function getIds(){
    if (!ids) {
      ids = [];
      var elements = document.querySelectorAll('[id]');
      Array.prototype.forEach.call(elements, function(element){
        ids.push(element.getAttribute('id').toLowerCase());
      });
    }
    return ids;
  }

  //get names of specified element in the document
  function getNames(){
    if (!commonNames) {
      commonNames = [];
      namesOfEmbed = [];
      namesOfFrameAndParam = [];

      var elements = document.querySelectorAll('[name]');
      var commonTags = ['A', 'APPLET', 'BUTTON', 'FORM', 'IFRAME', 'IMG',
        'INPUT', 'MAP', 'META', 'OBJECT', 'SELECT', 'TEXTAREA'];

      Array.prototype.forEach.call(elements, function(element){
        var tagName = element.tagName;
        var name = element.getAttribute('name').toLowerCase();
        if (commonTags.indexOf(tagName) >= 0) {
          commonNames.push(name);
        } else if (tagName == 'EMBED') {
          namesOfEmbed.push(name)
        } else if (tagName == 'FRAME' || tagName == 'PARAM') {
          namesOfFrameAndParam.push(name);
        }
      });
    }
    return {
      'commonNames': commonNames,
      'namesOfEmbed': namesOfEmbed,
      'namesOfFrameAndParam': namesOfFrameAndParam
    };
  }
}, //constructor

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
    Document.prototype, 'getElementById', this.getElementById_);
  chrome_comp.CompDetect.registerExistingMethodHook(
    Document.prototype, 'getElementsByName', this.getElementsByName_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
    Document.prototype, 'getElementById', this.getElementById_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
    Document.prototype, 'getElementsByName', this.getElementsByName_);
}
); // declareDetector

});