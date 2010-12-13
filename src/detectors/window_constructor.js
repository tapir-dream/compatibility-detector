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

'window_constructor',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.gatherAllProblemNodes_ = false;

  this.windowConstructorFilterShortSyntaxRegexp_ =
    /(\|\||\&\&)\s*(Window\s*(\.|\[)|window\s*(\.__proto__|\[\s*["']__proto__["']\s*\]\s*[\.\[])|window\s*(\.constructor|\[\s*["']constructor["']\s*\]\s*[\.\[]))/g;

  this.windowConstructorRegexp_ =
    /Window\s*(\.|\[)|window\s*(\.__proto__|\[\s*["']__proto__["']\s*\]\s*[\.\[])|window\s*(\.constructor|\[\s*["']constructor["']\s*\]\s*[\.\[])/g;

  this.multiLineScriptCommentsRegexp_ = /\/\*([\S\s]*?)\*\//g;
  this.oneLineScriptCommentsRegexp_ = /[^:\/]\/\/[^\n\r]*/gm;
},

function checkNode(node, context) {
  // Do not check page's root node(HTML tag).
  if (node == this.rootNode_)
    return;

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var This = this;
  var testResults = {
      windowConstructorFilterShortSyntaxRegexp_ : false,
      windowConstructorRegexp_ : false
  };

  //check script node
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
      this.addProblem('BX9045', [node]);
  //check inline events of other node
  } else {
    for (var i = 0,l = node.attributes.length; i < l; i++){
      if ( node.attributes[i].name.toLowerCase().indexOf('on') == 0 ) {
        //delete script comment
        scriptData = removeScriptComments(scriptData);
        setTestResults(scriptData);
        if (getTestDetectorResult())
          this.addProblem('BX9045', [node]);
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
    This.windowConstructorRegexp_.test('');
    testResults.windowEvalRegexp_ =
      This.windowConstructorRegexp_.test(scriptData);

    This.windowEvalFilterShortSyntaxRegexp_.test('');
    testResults.windowConstructorFilterShortSyntaxRegexp_ =
      !This.windowConstructorFilterShortSyntaxRegexp_.test(scriptData);

    This.windowConstructorFilterShortSyntaxRegexp_.test('');
  }

}
); // declareDetector

});
