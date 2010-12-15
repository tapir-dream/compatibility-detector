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
/*
 *                              IE6/7/8   Chrome 9.0.597.0 dev
 * [type]
 * text/javascript:              OK        OK
 * text/ecmascript:              OK        OK
 * text/livescript:              OK        OK
 * text/javascript1.1:           OK        OK
 * text/javascript1.2:           OK        OK
 * text/javascript1.3:           OK        OK
 * text/jscript:                 OK        OK
 * text/vbscript:                OK
 * text/vbs:                     OK
 * application/javascript:                 OK
 *
 * [Language]
 * javascript:                   OK        OK
 * ecmascript:                   OK        OK
 * livescript:                   OK        OK
 * javascript1.0:                          OK
 * javascript1.1:                OK        OK
 * javascript1.2:                OK        OK
 * javascript1.3:                OK        OK
 * javascript1.4:                          OK
 * javascript1.5:                          OK
 * javascript1.6:                          OK
 * javascript1.7:                          OK
 * jscript:                      OK        OK
 * vbscript:                     OK
 * vbs:                          OK
 *
 * [Language Encode]
 * jscript.encode:               OK
 * vbscript.encode:              OK
 *
 * [Mix]
 * text/javascript language=vbs: OK        OK
 * (We didn't check this situation now.)
 */

chrome_comp.CompDetect.declareDetector(

'script_language_type',

chrome_comp.CompDetect.ScanDomBaseDetector,

null,

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'SCRIPT')
    return;

  var type = node.getAttribute('type');
  if (type)
    type = type.toLowerCase();
  var language = node.getAttribute('language');
  if (language)
    language = language.toLowerCase();
  if (type == 'text/vbscript' || type == 'text/vbs' ||
      language == 'vbscript' || language == 'vbs')
    this.addProblem('BT9005', { nodes: [node], severityLevel: 3 });
  if (language == 'jscript.encode' || language == 'vbscript.encode')
    this.addProblem('BT9006', { nodes: [node], severityLevel: 3 });
}
); // declareDetector

});
