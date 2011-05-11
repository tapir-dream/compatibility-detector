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
 * @fileoverview Detector for document.getElementById and
 * document.getElementsByName problems.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=1
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=44
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=117
 *
 * In IE6 IE7 IE8(Q), the argument of document.getElementById(elementId) is case
 * insensitive. And for some elements, document.getElementById(elementName) can
 * work too, for these element, elementId and elementName are equal, and,
 * elementName is case-insensitive too.
 *
 * In IE6 IE7 IE8, for some elements, the argument of
 * document.getElementsByName(elementName) is case-insensitive.
 *
 * For the first problem, hook document.getElementById, so that we can get the
 * argument, it may means id or name.
 * Then, simulate IE's document.getElementById method, put the argument in it,
 * compare return values of the original one and the simulate one, if they are
 * dismatch, report problem.
 *
 * For the second problem, hook document.getElementsByName, so that we can get
 * the argument, it is a name value.
 * Then, simulate IE's document.getElementsByName method, put the argument in
 * it, check its return values, if there are any element which 'name'
 * attribute's value is not equals the argument by case sensitive, report
 * problem.
 *
 * Note: document.getElementsByName can only get elements whose tag name in
 * MIX_UP_TAGS and its name is matched (case-insensitive), but Chrome can
 * get all elements whose name is matched. We only check the case-insensitive
 * problem here. Detection of this problem may be added in the future.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'getelementbyid_and_getelementsbyname',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  var MIX_UP_TAGS = ['a', 'applet', 'button', 'embed', 'form', 'iframe',
    'img', 'input', 'map', 'meta', 'object', 'select', 'textarea'];

  /**
   * Get an xpath expression, match elements whose tag name is 'tagName', and
   * its attribute 'attribute' equals 'value' in case-insensitive.
   * @return An xpath expression, like:
   * //*[translate(@id,"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
   * "abcdefghijklmnopqrstuvwxyz")="foo"]
   */
  function getXpathExpression(tagName, attribute, value) {
    return '//' + tagName + '[translate(@' + attribute +
        ',"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz")="' +
        value.toLowerCase() + '"]';
  }

  /**
   * Get all elements whose id and name is mixed in IE6 IE7 IE8(Q), and only
   * these elements can use method document.getElementsByName() in IE.
   * @return An xpath expression, like:
   * //a[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
   * "abcdefghijklmnopqrstuvwxyz")="foo"] |
   * //applet[translate(@name,"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
   * "abcdefghijklmnopqrstuvwxyz")="foo"] |
   * //...
   * TODO: Find a better xpath expression.
   */
  function getXpathExpressionOfMixUpTags(value) {
    var xpathExpressions = [];
    MIX_UP_TAGS.forEach(function(tagName) {
      xpathExpressions.push(getXpathExpression(tagName, 'name', value));
    });
    return xpathExpressions.join('|');
  }

  /**
   * Simulate IE's document.getElementById.
   */
  function getElementByIdInIE(idOrName) {
    // Match *[id=value] and MixUpTags[name=value], case-insensitive.
    var xpathExpression = getXpathExpression('*', 'id', idOrName) + '|' +
        getXpathExpressionOfMixUpTags(idOrName);
    // Returns a ordered node snapshot, that includes all elements whose id or
    // name is case-insensitive equal to argument 'idOrName'.
    var elements = document.evaluate(xpathExpression, document, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    // elements.snapshotItem(0) may be null.
    return elements.snapshotItem(0);
  }

  // Hook document.getElementById.
  this.getElementById_ = function(result, originalArguments, callStack) {
    // Variable result will be undefined in an illegal invocation.
    if (originalArguments.length == 0 || typeof result == 'undefined')
      return;
    var idOrName = originalArguments[0];
    if (typeof idOrName != 'string')
      return;
    // Ignore calling by JQurey, JQuery will create an element with a name
    // 'script' + new Date().getTime(), and try to call document.getElementById
    // by using that name.
    if (/^script\d+$/.test(idOrName))
      return;
    // Compare gotten elements.
    var elementInIE = getElementByIdInIE(idOrName);
    if (result == elementInIE)
      return;
    // Get a wrong element, problem detected.
    var issueId;
    var details;
    if (elementInIE.id.toLowerCase() == idOrName.toLowerCase()) {
      issueId = 'SD9002';
      details = 'argument = ' + idOrName + ', id = ' + elementInIE.id + '.';
    // The elementInIE's id not case-insensitive equal to idOrName, its name
    // must be case-insensitive equal to idOrName.
    } else {
      issueId = 'SD9001';
      details = 'argument = ' + idOrName + ', name = ' + elementInIE.name + '.';
    }
    This.addProblem(issueId, {
      nodes: [elementInIE],
      details: details,
      stack: chrome_comp.dumpStack(),
      severityLevel: 3
    });
  };

  /**
   * Simulate IE's document.getElementsByName.
   */
  function getElementsByNameInIE(name) {
    var xpathExpression = getXpathExpressionOfMixUpTags(name);
    var elements = document.evaluate(xpathExpression, document, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var returnElements = [];
    for (var i = 0, length = elements.snapshotLength; i < length; i++) {
      returnElements.push(elements.snapshotItem(i));
    }
    return returnElements;
  }

  // Hook document.getElementsByName.
  this.getElementsByName_ = function(result, originalArguments, callStack) {
    // Variable result will be undefined in an illegal invocation.
    if (originalArguments.length == 0 || typeof result == 'undefined')
      return;
    var name = originalArguments[0];
    if (typeof name != 'string')
      return;
    // If get one wrong element, report problem.
    var elementsInIE = getElementsByNameInIE(name);
    // If result is not empty and elementsInIE is empty, it's another problem.
    // FF & Chrome can get <div name='foo'></div> by this method, but IE can't.
    // Problem SD9012 only detect the name value is case-insensitive.
    if (!elementsInIE)
      return;
    for (var i = 0, length = elementsInIE.length; i < length; i++) {
      var element = elementsInIE[i];
      if (element.name != name) {
        This.addProblem('SD9012', {
          nodes: [element],
          details: 'argument = ' + name + ', name = ' + element.name + '.',
          stack: chrome_comp.dumpStack(),
          severityLevel: 3
        });
      }
    }
  };
}, //constructor

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'getElementById', this.getElementById_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'getElementsByName', this.getElementsByName_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      document, 'getElementById', this.getElementById_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      document, 'getElementsByName', this.getElementsByName_);
}
); // declareDetector

});
