
var baseDetector = {};

baseDetector.HTML_DEPRECATED_TAGS = {
  APPLET: true,
  BASEFONT: true,
  CENTER: true,
  DIR: true,
  FONT: true,
  ISINDEX: true,
  MENU: true,
  S: true,
  STRIKE: true,
  U: true
};

baseDetector.HTML_DEPRECATED_ATTRIBUTES = {
  align: {
    CAPTION: true,
    APPLET: true,
    IFRAME: true,
    IMG: true,
    INPUT: true,
    OBJECT: true,
    LEGEND:true,
    TABLE:true,
    HR: true,
    DIV: true,
    H1: true,
    H2: true,
    H3: true,
    H4: true,
    H5: true,
    H6: true,
    P: true
  },
  alink: {
    BODY: true
  },
  alt: {
    APPLET: true
  },
  archive: {
    APPLET: true
  },
  background: {
    BODY: true
  },
  bgcolor: {
    TABLE: true,
    TR: true,
    TD: true,
    TH: true,
    BODY: true
  },
  border: {
    IMG: true,
    OBJECT: true
  },
  clear: {
    BR: true
  },
  code: {
    APPLET: true
  },
  codebase: {
    APPLET: true
  },
  color: {
    BASEFONT: true,
    FONT: true
  },
  compact: {
    DIR: true,
    DL: true,
    MENU: true,
    OL: true,
    UL: true
  },
  face: {
    BASEFONT: true,
    FONT: true
  },
  height: {
    TD: true,
    TH: true,
    APPLET: true
  },
  hreflang: {
    A: true,
    LINK: true
  },
  language: {
    SCRIPT: true
  },
  link: {
    BODY:true
  },
  name: {
    APPLET:true
  },
  noshade: {
    HR: true
  },
  nowrap: {
    TD: true,
    TH: true
  },
  object: {
    APPLET: true
  },
  prompt: {
    ISINDEX: true
  },
  size: {
    HR: true,
    FONT: true,
    BASEFONT:true
  },
  start: {
    OL: true
  },
  text: {
    BODY: true
  },
  type: {
    LI: true,
    OL: true,
    UL: true
  },
  value: {
    LI: true
  },
  version: {
    HTML: true
  },
  vlink: {
    BODY: true
  },
  vspace: {
    APPLET: true,
    IMG: true,
    OBJECT: true
  },
  width: {
    HR: true,
    TD: true,
    TH: true,
    APPLET: true,
    PRE: true
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
      pageDTD: '',
      compatMode: {}
    },
    DOM: {
      count: 0,
      IECondComm: []
    },
    STYLE: {
      totalCount: 0,
      notInHeadCount: 0
    },
    SCRIPT: {
      totalCount: 0,
      notInHeadCount: 0
    },
    LINK: {
      totalCount: 0,
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

baseDetector.initPageDTD = function() {
  baseDetector.summaryInformation.documentMode.pageDTD =
      document.doctype ? true : false;
};

/**
 * List common DTDs.
 * <!DOCTYPE [name] PUBLIC [publicId] [systemId] >
 * This list is based on:
 * http://hsivonen.iki.fi/doctype/
 */
baseDetector.PUBLIC_ID_WHITE_LIST = {
  '-//W3C//DTD HTML 3.2 Final//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.0//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.01//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.0//EN': {
    systemId: 'http://www.w3.org/TR/html4/strict.dtd'
  },
  '-//W3C//DTD HTML 4.01//EN': {
    systemId: 'http://www.w3.org/TR/html4/strict.dtd'
  },
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.01 Transitional//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.01 Transitional//EN': {
    systemId: 'http://www.w3.org/TR/html4/loose.dtd'
  },
  '-//W3C//DTD HTML 4.01 Transitional//EN': {
    systemId:
        'http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd'
  },
  '-//W3C//DTD XHTML 1.1//EN': {
    systemId: 'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd'
  },
  '-//W3C//DTD XHTML Basic 1.0//EN': {
    systemId: 'http://www.w3.org/TR/xhtml-basic/xhtml-basic10.dtd'
  },
  '-//W3C//DTD XHTML 1.0 Strict//EN': {
    systemId: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'
  },
  '-//W3C//DTD XHTML 1.0 Transitional//EN': {
    systemId:
        'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'
  },
  'ISO/IEC 15445:1999//DTD HyperText Markup Language//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemId: 'http://www.w3.org/TR/html4/loose.dtd'
  },
  'ISO/IEC 15445:2000//DTD HTML//EN': {
    systemId: ''
  },
  'ISO/IEC 15445:1999//DTD HTML//EN': {
    systemId: ''
  },
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemId: 'http://www.w3.org/TR/REC-html40/loose.dtd'
  }
};

/**
 * List the difference between IE and WebKit on the interpretion of DTD.
 * This list is based on:
 * http://hsivonen.iki.fi/doctype/
 */
baseDetector.COMPAT_MODE_DIFF_MAP = {
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemId: 'http://www.w3.org/TR/html4/loose.dtd',
    IE: 'S',
    WebKit: 'Q'
  },
  'ISO/IEC 15445:2000//DTD HTML//EN': {
    systemId: '',
    IE: 'Q',
    WebKit: 'S'
  },
  'ISO/IEC 15445:1999//DTD HTML//EN': {
    systemId: '',
    IE: 'Q',
    WebKit: 'S'
  },
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemId: 'http://www.w3.org/TR/REC-html40/loose.dtd',
    IE: 'S',
    WebKit: 'Q'
  }
};

baseDetector.initCompatMode = function() {

  function hasCommentBeforeDTD() {
    var prev = document.documentElement;
    if (!prev)
      return false;
    while (prev.previousSibling)
      prev = prev.previousSibling;
    var compatMode = document.compatMode.toLowerCase();
    if (prev && prev.nodeType == Node.COMMENT_NODE &&
        compatMode == 'css1compat') {
      // TODO: add comments here
      var comm = prev.nodeValue.split(/\s+/);
      if (comm.length < 1)
        return true;
      if (comm[0] != '[if')
        return true;
      if (/^!IE/g.test(comm[1]))
        return false;
      return true;
    }
    return false;
  }

  var doctype = document.doctype;
  var name = doctype ? doctype.name.toLowerCase() : '';
  var publicId = doctype ? doctype.publicId : '';
  var systemId = doctype ? doctype.systemId : '';
  var compatMode = document.compatMode.toLowerCase();

  if (name != 'html')
    baseDetector.summaryInformation.documentMode.strangeName = true;
  if (baseDetector.PUBLIC_ID_WHITE_LIST[publicId]) {
    if (baseDetector.PUBLIC_ID_WHITE_LIST[publicId].systemId != systemId)
      baseDetector.summaryInformation.documentMode.strangeSystemId = true;
  } else {
    baseDetector.summaryInformation.documentMode.strangePublicId = true;
  }
  if (name == 'html' && publicId == '' && systemId == '') {
    baseDetector.summaryInformation.documentMode.strangePublicId = false;
    baseDetector.summaryInformation.documentMode.strangeSystemId = false;
  }
  var doctypeInIE = (compatMode == 'backcompat') ? 'Q' : 'S';
  var doctypeInWebKit = doctypeInIE;

  // IE will render in quirks mode if there are comment before DTD. Chrome will
  // ignore the comment. Refer to:
  // http://www.w3help.org/zh-cn/causes/HG8001
  // TODO: check if IE9 is the same as Chrome.
  if (hasCommentBeforeDTD()) {
    doctypeInIE = 'Q';
    baseDetector.summaryInformation.documentMode.hasCommentBeforeDTD = true;
  }

  if (baseDetector.COMPAT_MODE_DIFF_MAP[publicId]) {
    if (baseDetector.COMPAT_MODE_DIFF_MAP[publicId]['systemId'] == systemId) {
      doctypeInIE = baseDetector.COMPAT_MODE_DIFF_MAP[publicId]['IE'];
      doctypeInWebKit = baseDetector.COMPAT_MODE_DIFF_MAP[publicId]['WebKit'];
    }
  }

  if (document.doctype) {
    // This DTD makes IE render in standards mode, Chrome in quirks mode
    // <!DOCTYPE "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'">
    // Sample URL: http://www.nasa.gov/
    if (document.doctype.name.toLowerCase() ==
        "\"xmlns:xsl='http://www.w3.org/1999/xsl/transform'\"") {
      doctypeInIE = 'S';
      doctypeInWebKit = 'Q';
    }
  }
  baseDetector.summaryInformation.documentMode.compatMode.IE = doctypeInIE;
  baseDetector.summaryInformation.documentMode.compatMode.WebKit =
      doctypeInWebKit;
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

baseDetector.initStyle = function() {
  var detectorStyleCount =
      document.getElementsByClassName('chrome-comp-annotations').length;
  var styleCount =
      document.querySelectorAll('style').length - detectorStyleCount;

  baseDetector.summaryInformation.STYLE.notInHeadCount =
      styleCount - document.querySelectorAll('body style').length;
  baseDetector.summaryInformation.STYLE.totalCount = styleCount;
};


baseDetector.initScript = function() {
  var detectorScripts =
      document.querySelectorAll('html[chrome_comp_injected] > script').length;
  var scriptCount =
      document.querySelectorAll('script').length - detectorScripts;
  baseDetector.summaryInformation.SCRIPT.totalCount = scriptCount;
  baseDetector.summaryInformation.SCRIPT.notInHeadCount =
      scriptCount - document.querySelectorAll('head script').length;
};

baseDetector.initLink= function() {
  var linkCount = document.querySelectorAll('link').length;
  baseDetector.summaryInformation.LINK.totalCount = linkCount;
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
  baseDetector.initPageDTD();
  baseDetector.initStyle();
  baseDetector.initScript();
  baseDetector.initLink();
  baseDetector.initCompatMode();
  baseDetector.initIECondComm(document.documentElement);
}

function getBaseDetectionStatus() {
  var status = 'ok';
  var summaryInformation = baseDetector.summaryInformation;
  var documentMode = summaryInformation.documentMode;
  if (!documentMode.pageDTD ||
      summaryInformation.DOM.IECondComm.length ||
      summaryInformation.STYLE.notInHeadCount ||
      summaryInformation.SCRIPT.notInHeadCount ||
      summaryInformation.LINK.notInHeadCount ||
      Object.keys(summaryInformation.HTMLBase.HTMLDeprecatedTag).length ||
      Object.keys(summaryInformation.HTMLBase.HTMLDeprecatedAttribute).length) {
    status = 'warning';
  } else if (documentMode.pageDTD) {
    if (documentMode.strangeName ||
        documentMode.strangePublicId ||
        documentMode.strangeSystemId ||
        documentMode.hasCommentBeforeDTD ||
        documentMode.compatMode.IE != documentMode.compatMode.WebKit) {
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
    type: 'setStatus',
    status: getBaseDetectionStatus()
  });

  return baseDetector.summaryInformation;
}

chrome.extension.onRequest.addListener(function(request, sender, response) {
  log('(base_detection.js) onRequest, request.type=' + request.type);
  switch (request.type) {
    case 'runBaseDetection':
      var summaryInformation = runBaseDetection();
      response(summaryInformation);
      break;
  }
});
