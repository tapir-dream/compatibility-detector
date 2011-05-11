/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Check if document type is different in IE and Chrome.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=56
 *
 * The comment or XML declaration before DTD will make the DTD be invalid in IE
 * so that the HTML document will be in quirks mode in IE. So We get the real
 * document mode in framework_shared.js, and save the state on
 * chrome_comp.documentMode object because it is useful in some detectors.
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'comment_before_doctype',

chrome_comp.CompDetect.NonScanDomBaseDetector,

null, // constructor

function postAnalyze() {
  // Get the real document mode values from chrome_comp.documentMode object.
  var documentMode = chrome_comp.documentMode;
  var doctypeInIE = documentMode.IE;
  var doctypeInWebKit = documentMode.WebKit;
  var hasCommentBeforeDTD = documentMode.hasCommentBeforeDTD;
  var details = 'IE: ' +
      (doctypeInIE == 'Q' ? 'Quirks Mode' : 'Standards Mode') +
      ', Chrome: ' +
      (doctypeInWebKit == 'Q' ? 'Quirks Mode' : 'Standards Mode');
  // Detect HG8001 issue.
  if (hasCommentBeforeDTD && doctypeInIE == 'Q' && doctypeInWebKit == 'S') {
    this.addProblem('HG8001', {details: details});
  }
}
); // declareDetector

});