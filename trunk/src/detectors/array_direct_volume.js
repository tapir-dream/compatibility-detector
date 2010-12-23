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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'array_direct_volume',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.gatherAllProblemNodes_ = false;
  this.arrayDirectVolumeRegexp_ = /,\]/g;
  this.stringDirectVolumeRegxp_ = /['"].+?['"]/g;
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;
},

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var scriptData = '';

  if (node.tagName == 'SCRIPT') {
    if (node.src && node.src != '')
      scriptData = (node.src in context) ? context[node.src] : '';
    else
      scriptData = node.text;

    // Delete script comment and string
    scriptData = scriptData
        .replace(this.oneLineScriptCommentsRegexp_, '')
        .replace(this.multiLineScriptCommentsRegexp_, '')
        .replace(this.stringDirectVolumeRegxp_, '');

    if (this.arrayDirectVolumeRegexp_.test(scriptData))
      this.addProblem('SJ2007', [node]);

  // Check inline events of other node
  } else {
    for (var i = 0, l = node.attributes.length; i < l; i++) {
      if (node.attributes[i].name.toLowerCase().indexOf('on') == 0) {
        scriptData = node.attributes[i].value
            .replace(this.oneLineScriptCommentsRegexp_, '')
            .replace(this.multiLineScriptCommentsRegexp_, '')
            .replace(this.stringDirectVolumeRegxp_, '');
        if (this.arrayDirectVolumeRegexp_.test(scriptData))
          this.addProblem('SJ2007', [node]);
      }
    }
  }
  // Clear the status of test method.
  this.arrayDirectVolumeRegexp_.test('');
  this.stringDirectVolumeRegxp_.test('');
  this.oneLineScriptCommentsRegexp_.test('');
  this.multiLineScriptCommentsRegexp_.test('');

}
); // declareDetector

});
