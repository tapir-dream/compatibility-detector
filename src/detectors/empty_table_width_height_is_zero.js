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

'empty_table_width_height_is_zero',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
	 
  if (Node.ELEMENT_NODE != node.nodeType ||
      Node.ELEMENT_NODE != node.parentNode.nodeType ||
      node.tagName != 'TABLE')
    return;
  if (node.tagName =='TABLE'&&(node.offsetWidth!='0' || node.offsetHeight!='0')) {       
    if (node.children.length=='0')               
      this.addProblem('RE1016', [node]);
  	else {
      var tdList = node.getElementsByTagName('td');   
      var thList = node.getElementsByTagName('th');
      var captionList=node.getElementsByTagName('caption');
      if (tdList.length <= 0 && thList.length <= 0 && captionList.length <= 0) 
        this.addProblem('RE1016', [node]);
     }	
  }
   
}
); // declareDetector

});