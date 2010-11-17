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

/*
 * 1. in IE6 IE7 IE8(Q) 'white-space' priority level : CSS property > nowrap attribute
 * 2. object.noWrap = true can't overlap effect of 'white-space' property that set by author,
 *    but it can overlap effect of 'white-space' property through setting by UA(normal) or nowrap attribute(nowrap).
 * 3. set object.noWrap to true or false only affect the 'white-space' property of DIV DD DT.
 */
addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'nowrap_attribute',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 * report problem if meeting one of the following 2 conditions:
 * 1. If element has nowrap attribute and computed value of 'white-space' property is not 'nowrap'
 *		1.1. Current element DOM object has not noWrap DOM attribute;
 *		1.2. element DOM object has noWrap DOM attribute and attribute value is excluding 
 *           false, 0, '', null, undefined, NaN etc.
 * 2. Author set elementDomObject.noWrap = true and not set 'white-space' property.
 *    This equals to only set nowrap attribute.
 */

function checkNode(node, context) {
  if(Node.ELEMENT_NODE != node.nodeType)
    return;
  var tagName = node.tagName;
  //if BODY has nowrap attribute, DIV and P can inherit from BODY and apply 'white-space : nowrap' in IE6 IE7 IE8(Q)
  //The page may has problem when only detecting BODY 
  if ((tagName != 'BODY' && tagName != 'DIV' && tagName != 'DT' && tagName != 'DD') || 
       context.isDisplayNone())
    return;
	
  var computedStyle = chrome_comp.getComputedStyle(node);
  var defStyle = chrome_comp.getDefinedStylePropertyByName(node, '', 'white-space');
	
	//main
  if ((node.hasAttribute('nowrap') && computedStyle.whiteSpace != 'nowrap' && 
      (!node.hasOwnProperty('noWrap') || node.noWrap)) || (node.noWrap && !defStyle) ){
    this.addProblem('HE1003', [node]);
  }
}
); // declareDetector

});
