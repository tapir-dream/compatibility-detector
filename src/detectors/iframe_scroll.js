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

'iframe_scroll',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone() ||
      node.tagName != 'IFRAME')
    return;

  var iframeScroll = node.getAttribute('scrolling');
  if (!iframeScroll || iframeScroll.toLowerCase() != 'no')
    return;

  try {
    var contentDocument = node.contentDocument;
    var contentHtmlOverflow = chrome_comp.getDefinedStylePropertyByName(
        contentDocument.documentElement, true, 'overflow');
    var contentHtmlIsScroll = contentHtmlOverflow == 'scroll';
    var contentBodyOverflow = chrome_comp.getDefinedStylePropertyByName(
        contentDocument.body, true, 'overflow');
    var contentBodyIsScroll = contentBodyOverflow == 'scroll';
    if (contentHtmlIsScroll || contentBodyIsScroll) {
      var details = 'HTML overflow: ' + contentHtmlOverflow + '\n' +
                    'BODY overflow: ' + contentBodyOverflow;
      this.addProblem('RX9009', {
        nodes: [node],
        details: details,
        // Uses a lower severity level if only one of html and body has
        // scroll.
        severityLevel: contentHtmlIsScroll && contentBodyIsScroll ? 0 : 3
      });
    }
  } catch (e) {
    chrome_comp.printError('Failed to access content DOM of iframe: ', e);
  }
}
); // declareDetector

});
