/*
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

'window_eval',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.windowEvalFilterShortSyntaxRegexp_ =
    /\b(?:[^||&&])\s*window(([.]eval)|(\[["']eval["']\]))\s?\(/g;

  this.windowEvalRegexp_ =
    /[^\w$]*window(([.]eval)|(\[["']eval["']\]))\s?\(/g;

  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;
},

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var This = this;
  var testResults = {
      windowEvalFilterShortSyntaxRegexp_:false,
      windowEvalRegexp_:false
  };

  var scriptData = '';
  if (node.tagName == 'SCRIPT') {
    if (node.src && node.src != '') {
      scriptData = (node.src in context) ? context[node.src] : '';
    } else {
      scriptData = node.text;
    }
    //delete script comment
    scriptData = removeScriptComments(scriptData);
    setTestResults(scriptData);
    if (getTestDetectorResult())
      this.addProblem('BX9056', [node]);
  } else {
    for (var i = 0,l = node.attributes.length; i < l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ){
        //delete script comment
        scriptData = removeScriptComments(node.attributes[i].value);
        setTestResults(scriptData);
        if (getTestDetectorResult())
          this.addProblem('BX9056', [node]);
      }
    }
  }

  function removeScriptComments(scriptData){
    return scriptData
           .replace(This.multiLineScriptCommentsRegexp_,'')
           .replace(This.oneLineScriptCommentsRegexp_,'');
  }

  function getTestDetectorResult(){
    return testResults.windowEvalRegexp_ &&
           testResults.windowEvalFilterShortSyntaxRegexp_;
  }

  function setTestResults(scriptData){
    This.windowEvalRegexp_.test('');
    testResults.windowEvalRegexp_ = This.windowEvalRegexp_.test(scriptData);
    This.windowEvalFilterShortSyntaxRegexp_.test('');
    testResults.windowEvalFilterShortSyntaxRegexp_ =
      !This.windowEvalFilterShortSyntaxRegexp_.test(scriptData);
    This.windowEvalFilterShortSyntaxRegexp_.test('');
  }

}
); // declareDetector

});
