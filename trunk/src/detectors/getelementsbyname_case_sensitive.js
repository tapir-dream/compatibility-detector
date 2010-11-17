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

'getelementsbyname_case_sensitive',

chrome_comp.CompDetect.NonScanDomBaseDetector,

/*
 * step of reporting problem:
 * 1. Listen document.getElementsByName method, when it's called and get no result:
 *   1.1 The element with name attribute:
 *     1.1.1 attribute value toLowerCase() equals to argument of getElementsByName toLowerCase()
 */

function constructor(rootNode) {
  var that = this;
  var names;

  this.getElementsByNameHandler_ = function(result, originalArguments, callStack) {
  	var arg0 = originalArguments[0];
	var lowerCaseNames = getNames();
    if(result.length == 0 && lowerCaseNames.indexOf(arg0.toLowerCase()) >= 0){
      that.addProblem('SD9012', {
		nodes: [this],
		details: 'document.getElementsByName(' + arg0 + ')',
		needsStack: true
	  });
    }
  };
  
  function getNames(){
  	if(!names){
      names = [];
  	  var elements = document.querySelectorAll('[name]');
      var length = elements.length;
      var i = length - 1;
      for (;i >= 0;i--){
  	    names.push(elements[i].getAttribute('name').toLowerCase());
      }
	}
	return names;
  }
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      Document.prototype, 'getElementsByName', this.getElementsByNameHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      Document.prototype, 'getElementsByName', this.getElementsByNameHandler_);
}
); // declareDetector

});
