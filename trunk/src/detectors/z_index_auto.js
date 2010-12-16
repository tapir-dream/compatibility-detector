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

chrome_comp.CompDetect.declareDetector(

'z_index_auto',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  this.addProblem_ = function(nodeList) {
    this.addProblem('RM8015', {nodes: nodeList, severityLevel: 3 });
  };
},

function postAnalyze() {
  var nodeList =
      Array.prototype.slice.call(document.getElementsByTagName('*'));
  var nodeClientRect = [];
  var overlapNodeList = [];

  // Filter elements are not visible and non-position
  nodeList.forEach(function (node,index) {
    var nodeComputedStyle = chrome_comp.getComputedStyle(node);
    if (nodeComputedStyle.display == 'none' ||
        nodeComputedStyle.visibility == 'hidden' ||
        nodeComputedStyle.position == 'static' ||
        nodeComputedStyle.zIndex != 'auto')
      return;
    nodeClientRect.push({
      'node' : node,
      'clientRect' : node.getBoundingClientRect()
    });
  });

  // Check the overlapping elements
  for (var i = 0, len = nodeClientRect.length; i < len; i++) {
    for (var j = i + 1; j < len; j++) {
      var nodeA = nodeClientRect[i];
      var nodeB = nodeClientRect[j];
      if (nodeA.clientRect.top < nodeB.clientRect.top &&
          nodeA.clientRect.bottom > nodeB.clientRect.top) {
        if (nodeA.clientRect.right > nodeB.clientRect.left &&
            nodeA.clientRect.left < nodeB.clientRect.right) {
          overlapNodeList.push({'nodeA' : nodeA.node, 'nodeB' : nodeB.node });
          continue;
        }
        if (nodeA.clientRect.left < nodeB.clientRect.right &&
            nodeA.clientRect.right > nodeB.clientRect.left ) {
          overlapNodeList.push({'nodeA' : nodeA.node, 'nodeB' : nodeB.node });
          continue;
        }
      }
      if (nodeB.clientRect.top < nodeA.clientRect.top &&
          nodeB.clientRect.bottom > nodeA.clientRect.top) {
        if (nodeB.clientRect.right > nodeA.clientRect.left &&
            nodeB.clientRect.left < nodeA.clientRect.right) {
          overlapNodeList.push({'nodeA' : nodeA.node, 'nodeB' : nodeB.node });
          continue;
        }
        if (nodeB.clientRect.right > nodeA.clientRect.left &&
            nodeB.clientRect.left < nodeA.clientRect.right) {
          overlapNodeList.push({'nodeA' : nodeA.node, 'nodeB' : nodeB.node });
          continue;
        }
      }
    }
  }

  function hasNodeBackground(nodeStyle) {
    return nodeStyle.backgroundImage != 'none' ||
           nodeStyle.backgroundColor != 'rgba(0, 0, 0, 0)';
  }

  var This = this;
  // Filter elements overlap with no father and son set the background elements
  overlapNodeList.forEach(function (overlapNodes,index) {
    var compareDocumentPosition =
        overlapNodes.nodeA.compareDocumentPosition(overlapNodes.nodeB);

    if (compareDocumentPosition === 20 || compareDocumentPosition === 10)
      return ;
    var nodeAStyle = chrome_comp.getComputedStyle(overlapNodes.nodeA);
    var nodeBStyle = chrome_comp.getComputedStyle(overlapNodes.nodeB);

    if (hasNodeBackground(nodeAStyle) && hasNodeBackground(nodeBStyle)) {
      This.addProblem_([overlapNodes.nodeA,overlapNodes.nodeB]);
      This.addProblem_([overlapNodes.nodeB,overlapNodes.nodeA]);
    }
  });
}

); // declareDetector

});
