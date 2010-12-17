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

// Detector for element.getAttribute and element.setAttribute
//
// Element.getAttribute(attributeName) is introduced in DOM level 1, which
// returns the value of the named attribute on the specified element. If the
// named attribute does not exist, the value returned will either be null or ''
// (the empty string).
//
// In IE 6, IE 7 and IE 8(Q), attribute is confused with property and
// element.getAttribute method is confused with dot method, which causes
// compatibility issues.

addScriptToInject(function() {

const INVALID_ATTRIBUTE_NAMES = {
  className: true,
  htmlFor: true
};

chrome_comp.CompDetect.declareDetector(

'get_and_set_attribute',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  var events = ['blur', 'change', 'click', 'dblclick', 'focus', 'mousedown',
      'mouseup', 'mouseover', 'mousemove', 'mouseout', 'keydown', 'keypress',
      'keyup', 'load', 'unload', 'select', 'submit', 'reset'];

  //When setting one of attributes below(attr1, attr2) on an element, such as 
  //element.setAttribute('disabled', 'disabled'), element.disabled will get 
  //Boolean true instead of String 'disabled'. And set attribute 'readonly', 
  //'nowrap' etc. will make element.readOnly to be Boolean true, but 
  //element.readonly is undefined.
  var attrs = ['async', 'defer', 'disabled', 'checked', 'multiple', 'selected',
      'compact', 'declare', 'readonly', 'nowrap', 'nohref', 'noshade'];

  this.getAttributeHandler_ = function(result, originalArguments, callStack) {
    var attributeName = originalArguments[0];
    if (attributeName == undefined)
      return;
    var lowerCaseAttrName = attributeName.toLowerCase();
    var hasOwnProperty = this.hasOwnProperty(attributeName);
    if (result == null && !hasOwnProperty)
      return;
    //filter jQuery and prototype
    if (!attributeName || isCalledFromJquery(arguments) || 
        isCalledFromPrototype(attributeName))
      return;

    if (INVALID_ATTRIBUTE_NAMES.hasOwnProperty(attributeName) ||
        // 1, 6. If element.getAttribute(attributeName) returns null, but
        // attributeName is a non-empty property of element, we warn the user
        // because he/she may mean to use element[attributeName].
        (result == null && hasOwnProperty) ||
        // 2. In IE 6, IE 7 and IE 8(Q), if element is an input object,
        // element.getAttribute('value') returns the current value, while
        // in Chrome it returns the initial value.
        (this.tagName == 'INPUT' && lowerCaseAttrName == 'value') ||
        // 4. In IE6, IE7 and IE8(Q), element.getAttribute('style') returns an
        // object and 5. element.getAttribute('onEventName') returns a function.
        // In Chrome etc it returns a string or null.
        lowerCaseAttrName == 'style' || 
        (lowerCaseAttrName.slice(2) == 'on' && 
          events.indexOf(lowerCaseAttrName.slice(2)) >= 0) ||
        // In IE6, IE7 and IE8(Q) element.getAttribute('disabled') returns true
        // or false; It returns a String or null in Chrome etc.
        attrs.indexOf(lowerCaseAttrName) >= 0 || 
        // <img src="xx.img" width="200px" />, In IE678 
        // IMG.getAttribute('width') returns NUMBER 200; In chrome it returns
        // String "200px". If IMG has no attribute width, in IE678 
        // IMG.getAttribute('width') returns original width of image, and in 
        // chrome it returns null.
        ((lowerCaseAttrName == 'width' || lowerCaseAttrName == 'height') && 
          this[lowerCaseAttrName] != result))
      This.addProblem('SD9006', {
        nodes: [this],
        details: this.tagName + '.getAttribute("' + attributeName + '")',
        needsStack: true
      });
  };
  this.setAttributeHandler_ = function(result, originalArguments, callStack) {
    if (originalArguments.length < 2)
      return false;
    var attributeName = originalArguments[0];
    var attributeValue = originalArguments[1];
    var lowerCaseAttrName = attributeName.toLowerCase();
    if (!attributeName || !attributeValue || isCalledFromJquery(arguments))
      return;

    //When setting attributes below and the resource value is specified by 
    //relative path. In IE8(S) and Chrome element.src returns the absolute path
    //src: SCRIPT, INPUT[type=image], FRAME, IFRAME, IMG
    //href: A, AREA, LINK, BASE
    //data: OBJECT
    var exceptiveAttrs = ['src', 'href', 'data'];
    var attributeType = typeof attributeValue;
    if (INVALID_ATTRIBUTE_NAMES.hasOwnProperty(attributeName) ||
        // In Chrome, the second param should always be a string, while in IE6,
        // IE7 and IE 8(Q), element.setAttribute('style', styleObject) requires
        // an object as the second param, and 5. element.setAttribute('onclick',
        // func) requires a function as the second param.
        // Cases of other primitive types which also work in Chrome are ignored.
        (lowerCaseAttrName.slice(2) == 'on' && 
          events.indexOf(lowerCaseAttrName.slice(2)) >= 0 &&
          (attributeType == 'function' || attributeType == 'string')) ||
        //attributeType == 'object' ||
        // 2. In IE 6, IE 7 and IE 8(Q), if element is an input object,
        // element.setAttribute('value', 'foo') sets the current value, while
        // in Chrome it sets the initial value.
        (this.tagName == 'INPUT' && lowerCaseAttrName == 'value') ||
        // 4. In IE6, IE7 and IE8(Q) element.setAttribute('style', styleText)
        // is not valid
        lowerCaseAttrName == 'style' ||
        // 6. In IE6, IE7 and IE8(Q) element.setAttribute('innerHTML', htmlText)
        // equivalent to element.innerHTML. offsetHeight etc is the same.
        (this.hasOwnProperty(attributeName) &&
          attributeValue != this[attributeName] && 
          exceptiveAttrs.concat(attrs).indexOf(lowerCaseAttrName) < 0))
      This.addProblem('SD9006', {
        nodes: [this],
        details: this.tagName + '.setAttribute("' + attributeName + 
          '",' + attributeValue + ')',
        needsStack: true
      });
  };

  //Determine if getAttribute or setAttribute is called from jQuery
  function isCalledFromJquery(args){
    var caller = args.callee.caller.caller;
    var callers = [];
    while (caller) {
      if (/jQuery/.test(caller))
        return true;
      if (callers.indexOf(caller) >= 0)
        return window.jQuery != undefined || false;
      caller = caller.caller;
      callers.push(caller);
    }
    return false;
  }
  
  function isCalledFromPrototype(attributeName){
    return attributeName == '_countedByPrototype';
  }
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.Element.prototype, 'getAttribute', this.getAttributeHandler_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      window.Element.prototype, 'setAttribute', this.setAttributeHandler_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.Element.prototype, 'getAttribute', this.getAttributeHandler_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window.Element.prototype, 'setAttribute', this.setAttributeHandler_);
}
); // declareDetector

});
