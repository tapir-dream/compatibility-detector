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

// ---------------------------------------------------------------------
// Detect <object>/<embed> tag which can not create a valid plugin
addScriptToInject(function() {

var WMP_MIME_TYPES = {
  'application/x-ms-wmp' : true,
  'application/asx' : true,
  'video/x-ms-asf-plugin' : true,
  'application/x-mplayer2' : true,
  'video/x-ms-asf' : true,
  'video/x-ms-wm' : true,
  'audio/x-ms-wma' : true,
  'audio/x-ms-wax' : true,
  'video/x-ms-wmv' : true,
  'video/x-ms-wvx' : true
};

chrome_comp.CompDetect.declareDetector(

'plugin',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  // Indicates that the problem is found by backend detector or
  // detector logic in this JS file.
  this.foundProblemByBackend_ = false;
},

function getParamByName(object, name) {
  for (var child = object.firstChild; child; child = child.nextSibling) {
    if (Node.ELEMENT_NODE == child.nodeType &&
        child.nodeName.toLowerCase() == 'param') {
      var value = child.getAttribute('name');
      try {
        if (value && value.toString().toLowerCase() == name)
          return child.getAttribute('value');
      } catch (e) {}
    }
  }
  return undefined;
},

function postAnalyze() {
  if (this.window_.layoutInfoInspector &&
      this.window_.layoutInfoInspector.pageHasInvalidPlugins) {
    var problemNode =
        this.window_.layoutInfoInspector.pageHasInvalidPlugins(this.document_);
    if (problemNode) {
      this.addProblem('##0019', [problemNode]);
      return;
    }
  }
  var objects = document.getElementsByTagName('object');
  const kWMPClassId1 = 'clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95';
  const kWMPClassId2 = 'clsid:6bf52a52-394a-11d3-b153-00c04f79faa6';
  for (var i = 0, c = objects.length; i < c; ++i) {
    var classid = objects[i].getAttribute('classid');
    try {
      if (classid)
        classid = classid.toLowerCase();
    } catch (e) {
    }
    if (classid == kWMPClassId1 || classid == kWMPClassId2) {
      var type = objects[i].getAttribute('type');
      // see http://qq.qqjia.com/daima/da1670.htm.
      if (type && !(WMP_MIME_TYPES.hasOwnProperty(type))) {
        chrome_comp.trace(type);
        this.addProblem('##0018', [objects[i]]);
      }
    }
  }
}
); // declareDetector

});
