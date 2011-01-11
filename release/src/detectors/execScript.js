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

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'execScript',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  this.execScriptSyntaxRegexp_ =
    /([^\w$]*execScript\s?[\(\w$])|([^\w$]*window([.]execScript|\[["']execScript["']\])\s?[\(\w$])/g
  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;

  var scriptData = '';
  if (node.tagName == 'SCRIPT') {
    if (node.src && node.src != '')
      scriptData = (node.src in context) ? context[node.src] : '';
    else
      scriptData = node.text;

    //delete script comment
    scriptData = scriptData.replace(this.oneLineScriptCommentsRegexp_, '')
        .replace(this.multiLineScriptCommentsRegexp_, '');

    if (this.execScriptSyntaxRegexp_.test(scriptData)) {
      this.addProblem('BX9055', [node]);
      this.execScriptSyntaxRegexp_.test('');
    }
  } else {
    for (var i = 0, l = node.attributes.length; i < l; i++) {
      if (node.attributes[i].name.toLowerCase().indexOf('on') == 0) {
        //delete script comment
        scriptData = node.attributes[i].value
            .replace(this.oneLineScriptCommentsRegexp_, '')
            .replace(this.multiLineScriptCommentsRegexp_, '');
      }
      if (this.execScriptSyntaxRegexp_.test(scriptData)) {
        this.addProblem('BX9055', [node]);
        this.execScriptSyntaxRegexp_.test('');
      }
    }
  }
}
); // declareDetector

});
