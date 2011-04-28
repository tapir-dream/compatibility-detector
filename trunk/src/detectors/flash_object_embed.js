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

/**
 * @fileoverview Check flash OBJECT and it's child EMBED element
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=159
 *
 * If you introduce Flash objects by using OBJECT element's classid attribute
 * only, or using nested OBJECT and EMBED elements and their parameters are
 * discrepant, the Flash maybe not be introduced in some browsers.
 */

addScriptToInject(function() {

var FLASH_TYPES = {
  'application/x-shockwave-flash': true,
  'application/x-oleobject': true
};

var FLASH_CLSID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';

chrome_comp.CompDetect.declareDetector(

'flash_object_embed',

chrome_comp.CompDetect.ScanDomBaseDetector,

function constructor() {

  /**
   * Get all attributes.
   * All keys are converted to lower case.
   * @return {Object.<string, string>}
   */
  this.getAllAttributes = function(element) {
    var attributes = {};
    for (var i = 0, c = element.attributes.length; i < c; ++i) {
      var attr = element.attributes[i];
      attributes[attr.name.toLowerCase()] = attr.value;
    }
    return attributes;
  };

  /**
   * Get attributes defined by PARAM child nodes.
   * All keys are converted to lower case.
   * @param {Element} element
   * @param {Object.<string, string>} attributes Optional object to hold the
   *  result
   * @return {Object.<string, string>}
   */
  this.getAttributesDefinedByParam = function(element, attributes) {
    var children = element.children;
    if (!attributes)
      attributes = {};
    for (var i = 0, c = children.length; i < c; ++i) {
      var child = children[i];
      if (child.tagName == 'PARAM') {
        var name = child.getAttribute('name') || '';
        name = name.toLowerCase();
        if (name)
          attributes[name] = child.getAttribute('value') || '';
      }
    }
    return attributes;
  };

},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || context.isDisplayNone())
    return;
  if (node.tagName != 'OBJECT')
    return;

  // Ignore non-flash OBJECT
  var classid = node.getAttribute('classid') || '';
  if (classid && classid.toLowerCase() != FLASH_CLSID)
    return;
  var type = node.getAttribute('type') || '';
  if (type && !(type.toLowerCase() in FLASH_TYPES))
    return;

  var embedElements = node.getElementsByTagName('embed');
  if (embedElements.length == 0) {
    return;
  } else if (embedElements.length > 1) {
    embedElements = Array.prototype.slice.call(embedElements);
    var oldLength = embedElements.length;
    embedElements.unshift(node);
    this.addProblem('HO8001', {
      nodes: embedElements,
      // TODO: localize this
      details: 'There are ' + oldLength + ' EMBED elements in OBJECT element.',
      severityLevel: 9
    });
    return;
  }

  var embed = embedElements[0];
  var bError = false;
  var details = [];

  var embedType = embed.getAttribute('type') || '';
  if (!(embedType in FLASH_TYPES)) {
    bError = true;
    details.push('EMBED type="' + embedType + '"');
  }

  var objectAttributes = this.getAllAttributes(node);
  this.getAttributesDefinedByParam(node, objectAttributes);
  var objectSrc = objectAttributes['movie'];
  if (!objectSrc)
    objectSrc = objectAttributes['data'];
  var embedSrc = embed.getAttribute('src') || '';
  // IE8 and other browsers support OBJECT's data attribute.
  // IE6/7 support PARAM element named 'movie'.
  if (objectSrc != embedSrc) {
    bError = true;
    details.push('OBJECT movie="' + objectSrc + '", EMBED src="' + embedSrc
        + '"');
  }

  var objectWidth = objectAttributes['width'] || '';
  var embedWidth = embed.getAttribute('width') || '';
  var objectHeight = objectAttributes['height'] || '';
  var embedHeight = embed.getAttribute('height') || '';
  if (objectWidth != embedWidth || objectHeight != embedHeight) {
    bError = true;
    details.push('OBJECT ' + objectWidth + ' * ' + objectHeight + ', EMBED '
        + embedWidth + ' * ' + embedHeight);
  }

  var objectId = objectAttributes['id'] || '';
  var embedName = embed.getAttribute('name') || '';
  if (objectId && embedName && objectId != embedName) {
    details.push('OBJECT id="' + objectId + '", EMBED name="' + embedName
        + '"');
  }

  var objectWmode = objectAttributes['wmode'] || '';
  var embedWmode = embed.getAttribute('wmode') || '';
  // The 'wmode' attribute's default value is 'window'.
  if (!objectWmode)
    objectWmode = 'window';
  if (!embedWmode)
    embedWmode = 'window';
  if (objectWmode.toLowerCase() != embedWmode.toLowerCase()) {
    details.push('OBJECT wmode="' + objectWmode + '", EMBED wmode="'
        + embedWmode + '"');
  }

  // Refer to:
  // http://kb2.adobe.com/cps/127/tn_12701.html
  // http://kb2.adobe.com/cps/403/kb403183.html
  var OTHER_ATTRIBUTES = {
    align: true,
    allowscriptaccess: true,
    base: true,
    bgcolor: true,
    flashvars: true,
    menu: true,
    play: true,
    quality: true,
    salign: true,
    scale: true
  };

  for (var name in OTHER_ATTRIBUTES) {
    var objectValue = objectAttributes[name] || '';
    var embedValue = embed.getAttribute(name) || '';
    if (objectValue != embedValue) {
      details.push('OBJECT ' + name + '="' + objectValue + '", EMBED ' + name
          + '="' + embedValue + '"');
    }
  }

  if (details.length > 0) {
    var severityLevel = bError ? 9 : 1;
    this.addProblem('HO8001', {
      nodes: [node, embed],
      details: details.join('\n'),
      severityLevel: severityLevel
    });
  }
}
); // declareDetector

});
