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

'protocol_target',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, additionalData) {
  function isBaseTargetBlank() {
    var baseList = document.getElementsByTagName('base');
    return {
      IE: baseList.length > 0 &&
          baseList[baseList.length - 1].target.toLowerCase() == '_blank',
      Chrome: baseList.length > 0 &&
          baseList[0].target.toLowerCase() == '_blank'
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'A' && node.tagName != 'AREA')
    return;

  var href = node.href.trim(), reCus = /^\w*$/gi;
  var map = {
    IE: {
      javascript: true,
      mailto: false,
      'view-source': true,
      custom: true
    },
    Chrome: {
      javascript: false,
      mailto: true,
      'view-source': true,
      custom: true
    }
  };
  var protocol = href.split(':')[0];
  var list = ['javascript', 'mailto', 'view-source'];
  if (list.indexOf(protocol) == -1 && reCus.test(protocol)) {
    protocol = 'custom';
  }
  if ((map.IE[protocol] && isBaseTargetBlank().IE) != (map.Chrome[protocol] &&
      isBaseTargetBlank().Chrome))
    this.addProblem('BX2032', [node]);
}
); // declareDetector

});

