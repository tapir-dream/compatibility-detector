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

// One detector implementation for checking 'undetectable document.all' problems
// @author : jnd@chromium.org
// @bug: http://b/hotlist?id=10048
//
// All web pages caught by this detector do not mean that those pages have real
// problems, but at least, they have potential compatibility problems since
// they try to detect document.all.  The following is detail explaination.
//
// Too many sites check for support of document.all and assume that the browser
// is Internet Explorer. As a result, they often give Chrome the way designed to
// only work with Internet Explorer, which might casue page unworkable. If they
// fail to detect it, either they use standards compliant code or they will
// abandon the effort of making page workable.  Chrome implement the
// 'undetectable document.all', which means you couldn't test for it and decide
// to go down the IE branch of a script, but you still could use
// document.all[index] or document.all[element's id] , which allow the page to
// continue working. It might make huge legacy pages workable if there are no
// other non-standard js codes to use.
// However supporting document.all caused problems (It still does), especially
// using this to detect Firefox, Chrome, Safari and Opera.
// Also W3C has provided its successors document.getElementById and
// getElementsByTagName to replace the obsolete 'document.all'. So I think it's
// time to measure how impact this problem is and educate webmasters to use
// standard method.
// There are two ways to check 'documet.all'
// First One is only check whether the code checks 'document.all', if it does,
// it might mean the page uses this to guess browser
// type.  It's pretty dangerous (see bug http://b/issue?id=954012).
// The second way is all 'document.all' usages, such as 'document.all[]',
// 'document.all.xx'. We should collect all sites which use this
// non-standard approach and tell the webmaster of those sites that they should
// use document.getElementById and
// getElementsByTagName.
// For now, I use the first way.
addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'document_all',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor(rootNode) {
  this.gatherAllProblemNodes_ = false;
  this.documentAllRegexp_ = /[^\w$]+document[.]all\s?[^\(.\[\w$]/g;
},

function checkNode(node, context) {
  // Do not check page's root node(HTML tag).
  if (node == this.rootNode_)
    return;

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  // only check script node
  if (node.tagName != 'SCRIPT')
    return;
  var scriptData;
  if (node.src && node.src != '') {
    scriptData = (node.src in context) ? context[node.src] : '';
  } else {
    scriptData = node.text;
  }
  if (this.documentAllRegexp_.test(scriptData)) {
    this.addProblem('BX9002', [node]);
    // Clear the status of test method.
    this.documentAllRegexp_.test('');
  }
}
); // declareDetector

});
