/**
 * @fileoverview This file contains a quick check of the page, include:
 *  - whether DTD exists, and is valid
 *  - deprecated HTML tags and attributes
 *  - LIND and STYLE elements that are not put inside the HEAD section
 *  - IE's conditional comments
 *
 * We must ensure that it will not run for a long time. Its result should not
 * be cached.
 */

var baseDetector = {};

baseDetector.HTML_DEPRECATED_TAGS = {
  APPLET: true,
  CENTER: true,
  FONT: true,
  S: true,
  STRIKE: true,
  U: true,
  LAYER: true
};

baseDetector.HTML_DEPRECATED_ATTRIBUTES = {
  align: {
    IFRAME: true,
    IMG: true,
    OBJECT: true,
    TABLE:true
  },
  color: {
    FONT: true
  },
  height: {
    TD: true,
    TH: true
  },
  language: {
    SCRIPT: true
  },
  noshade: {
    HR: true
  },
  nowrap: {
    TD: true,
    TH: true
  },
  size: {
    HR: true,
    FONT: true,
    BASEFONT:true
  }
};

baseDetector.isHTMLDeprecatedAttribute = function(tagName, attrName) {
  return (this.HTML_DEPRECATED_ATTRIBUTES[attrName] &&
          this.HTML_DEPRECATED_ATTRIBUTES[attrName][tagName]);
};

baseDetector.isHTMLDeprecatedTag = function(tagName) {
  return this.HTML_DEPRECATED_TAGS[tagName];
};

baseDetector.getNodes = function(rootNode, nodeFilter) {
  var nodeIterator = document.createNodeIterator(
      rootNode, nodeFilter, null, false);
  var nodes = [];
  var node = nodeIterator.nextNode();
  while (node) {
    nodes.push(node);
    node = nodeIterator.nextNode();
  }
  return nodes;
};

baseDetector.resetSummaryInformation = function() {
  baseDetector.summaryInformation = {
    HTMLBase: {
      HTMLDeprecatedAttribute: {},
      HTMLDeprecatedTag: {}
    },
    documentMode: {
      hasDocType: false,
      compatMode: {IE: 'Q', WebKit: 'Q'},
      publicId: '',
      hasComment: false,
      hasConditionalComment: false,
      isUnusualDocType: false
    },
    DOM: {
      IECondComm: []
    },
    LINK: {
      notInHeadCount: 0
    }
  };
};

baseDetector.addDeprecatedTag = function(paramObject) {
  var element = paramObject.element;
  var tagName = element.tagName;
  var HTMLDeprecatedTag =
      baseDetector.summaryInformation.HTMLBase.HTMLDeprecatedTag;
  if (!HTMLDeprecatedTag[tagName]) {
    HTMLDeprecatedTag[tagName] = true;
  }
};

baseDetector.addDeprecatedAttribute = function(paramObject) {
  var element = paramObject.element;
  var attribute = paramObject.attr;
  var tagName = element.tagName;
  var HTMLDeprecatedAttribute =
      baseDetector.summaryInformation.HTMLBase.HTMLDeprecatedAttribute;
  if (!HTMLDeprecatedAttribute[attribute]) {
    HTMLDeprecatedAttribute[attribute] = {};
  }
  HTMLDeprecatedAttribute[attribute][tagName] = tagName;
};

baseDetector.initCompatMode = function() {
  baseDetector.summaryInformation.documentMode = chrome_comp.documentMode;
};

baseDetector.initIECondComm = function(rootNode) {
  var nodes = baseDetector.getNodes(rootNode, NodeFilter.SHOW_COMMENTS);
  var ieCondCommRegExp = /\[\s*if\s*[^\]][\s\w]*\]/i;
  for (var i = 0, c = nodes.length; i < c; ++i) {
    var currentNode = nodes[i];
    if (ieCondCommRegExp.test(currentNode.nodeValue)) {
      baseDetector.summaryInformation.DOM.IECondComm.push(
          currentNode.nodeValue);
    }
  }
};

baseDetector.initLink= function() {
  var linkCount = document.querySelectorAll('link').length;
  baseDetector.summaryInformation.LINK.notInHeadCount =
      linkCount - document.querySelectorAll('head link').length;
};

baseDetector.scanAllElements = function() {
  var elementList = baseDetector.getNodes(document.documentElement,
      NodeFilter.SHOW_ELEMENT);

  baseDetector.summaryInformation.DOM.count = elementList.length;

  for (var i = 0, len = elementList.length; i < len; ++i) {
    var element = elementList[i];
    var tagName = element.tagName;
    var attributes = element.attributes;
    if (this.isHTMLDeprecatedTag(tagName)) {
      this.addDeprecatedTag({
        element: element,
        tagName: tagName
      });
    }
    for (var j = 0, c = attributes.length; j < c; ++j) {
      var attrName = attributes[j].name;
      if (this.isHTMLDeprecatedAttribute(tagName, attrName)) {
        this.addDeprecatedAttribute({
          element: element,
          attr: attrName
        });
      }
    }
  }
};

baseDetector.init = function (){
  baseDetector.initLink();
  baseDetector.initCompatMode();
  baseDetector.initIECondComm(document.documentElement);
}

function getBaseDetectionStatus() {
  var status = 'ok';
  var summaryInformation = baseDetector.summaryInformation;
  var documentMode = summaryInformation.documentMode;
  if (!documentMode.hasDocType ||
      summaryInformation.DOM.IECondComm.length ||
      summaryInformation.LINK.notInHeadCount ||
      Object.keys(summaryInformation.HTMLBase.HTMLDeprecatedTag).length ||
      Object.keys(summaryInformation.HTMLBase.HTMLDeprecatedAttribute).length) {
    status = 'warning';
  } else if (documentMode.hasDocType) {
    if (documentMode.isUnusualDocType ||
        documentMode.hasCommentBeforeDTD ||
        documentMode.hasConditionalCommentBeforeDTD ||
        documentMode.IE != documentMode.WebKit) {
      status = 'warning';
    }
  }
  return status;
}

function runBaseDetection() {
  baseDetector.resetSummaryInformation();
  baseDetector.scanAllElements();
  baseDetector.init();

  chrome.extension.sendRequest({
    type: REQUEST_SET_STATUS,
    status: getBaseDetectionStatus()
  });

  return baseDetector.summaryInformation;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  log('(base_detection.js) onRequest, request.type=' + request.type);
  switch (request.type) {
    case REQUEST_RUN_BASE_DETECTION:
      var summaryInformation = runBaseDetection();
      sendResponse(summaryInformation);
      break;
  }
});
