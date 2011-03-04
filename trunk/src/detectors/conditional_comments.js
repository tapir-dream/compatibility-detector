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
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=124
 * WontFix
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'conditional_comments',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.COMMENT_NODE != node.nodeType)
    return;

  // IE supports two different kinds of conditional comments:
  // - A downlevel-hidden conditional comment is started by <--![if ...]> and
  //   ended by <![endif]-->. Chrome treats it as a whole comment and we won't
  //   warn users.
  // - A downlevel-revealed conditional comment is started by <![if ...]> and
  //   ended by <![endif]>. Chrome turns the two tags into two comments and
  //   processes the contents between them. We'll warn users because users may
  //   not expect this behavior.
  if (node.nodeValue.match(/^ *\[ *if [^\]]*\] *$/i))
    this.addProblem('BT8004', {nodes: [node], severityLevel: 1 });
}
); // declareDetector

});
