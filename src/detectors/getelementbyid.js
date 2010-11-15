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

// *** One detector implementation for 'document.getElementById' problems *****
// @author : yzshen@chromium.org
// @bug: http://b/hotlist?id=10090
//
// Document.getElementById(elementId) is introduced in DOM level 2, which
// returns the element that has an ID attribute with the given value. In
// IE7 and previous IE versions, this method performs a case-insensitive match
// on both the ID and NAME attributes. This is incompatible with standards and
// might produce unexpected results. (IE8 has fixed this issue, performing a
// case-sensitive match on the ID attribute only.)
//
// Here is the way how we detect non-standard document.getElementById behavior:
// Before the page is loaded, we install a hook to monitor all calls to
// Document.getElementById() and record inputted elementId's. After the page is
// fully loaded, we navigate the whole DOM tree. For each element, we examine
// if (1) its ID/NAME can match some elementId in a case-insensitive way; (2)
// it precedes the correct target node. If such a node is detected, we catch a
// compatibility issue.

// (Added by markhuang) Above method has a flaw, the page is dynamic, we
// must check when getElementById is called.
// The new logic is:
// 1. Hook document.getElementById
// 2. If getElementById returns null, but getElementsByName returns any element,
//    mark the parameter as a potential error
// 3. Scan the DOM tree, for each element, we examine:
// if (1) its ID/NAME can match some elementId in a case-insensitive way; (2)
// it precedes the correct target node. If such a node is detected, we catch a
// compatibility issue.
//
// There will still be false-positive, such as: IE's getElementsByName does not
// work for DIV; an element with the same name as another element's ID is
// created after getElementById is called.
// The false-negative is IE's getElementById is case-insensitive.

addScriptToInject(function() {

var registerDetectorSuccess = chrome_comp.CompDetect.declareDetector(

'getelementbyid',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var idMap =
      chrome_comp.CompDetect.documentGetElementByIdHookHandler.getContextData();

  var tagName = node.tagName;
  var idNameArray = [];
  var nodeIdValue;
  if (node.id && typeof node.id == 'string')
    nodeIdValue = node.id;
  else
    nodeIdValue = node.getAttribute('id');
  if (nodeIdValue)
    idNameArray.push(nodeIdValue.toLowerCase());
  var name = node.getAttribute('name');
  if (name)
    idNameArray.push(name.toLowerCase());

  for (var i = 0, c = idNameArray.length; i < c; i++) {
    var id = idNameArray[i];
    if (idMap[id]) {
      var covered_id_set = idMap[id];
      delete idMap[id];
      var idCorrespondingObj = covered_id_set[nodeIdValue];
      if (idCorrespondingObj) {
        delete covered_id_set[nodeIdValue];
        // if the nodeIdValue has object and the object is equal with current
        // node, which means the getElementById will always to right element,
        // We can live with it
        if (idCorrespondingObj.element == node) {
          continue;
        }
      } else if (covered_id_set[name]) {
        // For input element, if there are two inputs, current node's name
        // is equal with the name of the one which getElementById can find
        // and those two inputs have same type and value. we can consider
        // this situation is OK. Becuase in this case. Chrome can get the
        // element which has correct id, IE can get the element which
        // has same name, and they are same in other areas.
        idCorrespondingObj = covered_id_set[name].element;
        if ((idCorrespondingObj instanceof this.window_.Element) &&
            idCorrespondingObj != node) {
          var idCorrespondingObjTagName = idCorrespondingObj.tagName;
          if (tagName == 'INPUT' &&
              tagName == idCorrespondingObjTagName &&
              name == idCorrespondingObj.id &&
              node.type == idCorrespondingObj.type &&
              node.value == idCorrespondingObj.value) {
            // But it's still a potential problem. Should we report?
            continue;
          }
        }
      }
      for (var covered_id in covered_id_set) {
        var stack = covered_id_set[covered_id].stack;
        this.addProblem('SD9001', {nodes: node, details: name, stack: stack});
        return;
      }
    }
  }
}
); // declareDetector

// ********* documentGetElementByIdHookHandler implementation****************
if (registerDetectorSuccess) {
chrome_comp.CompDetect.documentGetElementByIdHookHandler = (function() {
  var idMap_ = {};

  function recordElementId(result, originalArguments, callStack) {
    var id = originalArguments[0];
    if (!id)
      return;

    if (result)
      return;

    // By adding this, we will miss some cases that IE selects by ID in a
    // case-insensitive way. But this is better than false-positives.
    if (0 == document.getElementsByName(id).length)
      return;

    var stack = chrome_comp.dumpStack();
    if (chrome_comp.isCalledFromExtension(stack))
      return;

    var lowerId = id.toLowerCase();
    if (!idMap_[lowerId])
      idMap_[lowerId] = {};
    idMap_[lowerId][id] = {element: result, stack: stack};
  }

  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'getElementById', recordElementId);

  return {
    getContextData : function() {
      return idMap_;
    }
  };
})();
}
});
