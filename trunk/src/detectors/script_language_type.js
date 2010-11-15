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

// Languages supported by all main browsers.
const ACCEPTED_SCRIPT_LANGUAGES = {
  'javascript': true,
  'javascript1.0': true,
  'javascript1.1': true,
  'javascript1.2': true,
  'javascript1.3': true,
  'livescript': true
};

// Script MIME types supported by all main browsers.
const ACCEPTED_SCRIPT_TYPES = {
  'text/javascript': true,
  'text/ecmascript': true,
  'text/jscript': true
};

chrome_comp.CompDetect.declareDetector(

'script_language_type',

chrome_comp.CompDetect.ScanDomBaseDetector,

null,

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'SCRIPT')
    return;

  var type = node.getAttribute('type');
  var typeIsAccepted = !type ||
      ACCEPTED_SCRIPT_TYPES.hasOwnProperty(type.toLowerCase());
  var language = node.getAttribute('language');
  var languageIsAccepted = !language ||
      ACCEPTED_SCRIPT_LANGUAGES.hasOwnProperty(language.toLowerCase());
  if (!typeIsAccepted)
    this.addProblem('BT9005', [node]);
  if (!languageIsAccepted) {
    // Use custom severity level 3 (warning) if type is specified, otherwise
    // default severity level (error).
    var severityLevel = type ? 3 : 0;
    var languageIsEncode = language.match(/\.encode$/);
    this.addProblem(languageIsEncode ? 'BT9006' : 'BT9005',
        { nodes: [node], severityLevel: severityLevel });
  }
}
); // declareDetector

});
