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

/**
 * @fileoverview: This file contains code shared by content script and page
 * script.
 */

addScriptToInjectAndExecuteInContentScript(function() {

// Create the top level namespace if it is not present.
if ("undefined" == typeof chrome_comp) {
  chrome_comp = {};
}

// Sample of how to add new method to current namespace:
// chrome_comp.someNewMethod = function() { ... };

/**
 * For more exact detect, We can not simply get the document mode by
 * chrome_comp.inQuirksMode(), because some strange doctypes may trigger the
 * different document modes between IE and Chrome, and the comments before the
 * doctype declaration make the doctype be invalid in IE. Thus, we use this
 * script to detect the exact document modes in IE and Chrome.
 */

// The result of doctype detection.
var documentMode = {
  // The document mode of the current page in IE and WebKit. S stands the
  // Standards Mode, Q stands the Quirks Mode. undefined of IE stands the
  // document mode is uncertain, the DTD is unusual or has some kinds of
  // conditional comments.
  IE: 'Q',
  WebKit: 'Q',
  // Whether there have comments before the doctype.
  hasCommentBeforeDTD: false,
  // Whether there have IE's conditional comments before the doctype.
  hasConditionalCommentBeforeDTD: false,
  // Whether the doctype is unusual.
  isUnusualDocType: false,
  // Whether the page has the doctype.
  hasDocType: false
};


// <!DOCTYPE name PUBLIC publicId systemId >
// We list some common doctypes which make IE and Chrome render in the same
// document mode. Some doctypes may share the same publicId, so we make the
// publicId as the key.
// Note: HTML5 doctype <!DOCTYPE html> do not have publicId and systemId. So
// the keys are empty strings.
// This list is based on:
// http://www.w3help.org/zh-cn/kb/001#common_dtd.
var PUBLIC_ID_WHITE_LIST = {
  '': {
    systemIds: {
      '': true
    }
  },
  '-//W3C//DTD HTML 3.2 Final//EN': {
    systemIds: {
      '': true
    }
  },
  '-//W3C//DTD HTML 4.0//EN': {
    systemIds: {
      '': true,
      'http://www.w3.org/TR/html4/strict.dtd': true
    }
  },
  '-//W3C//DTD HTML 4.01//EN': {
    systemIds: {
      '': true,
      'http://www.w3.org/TR/html4/strict.dtd': true
    }
  },
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemIds: {
      '': true,
      'http://www.w3.org/TR/html4/loose.dtd': true
    }
  },
  '-//W3C//DTD HTML 4.01 Transitional//EN': {
    systemIds: {
      '': true,
      'http://www.w3.org/TR/html4/loose.dtd': true,
      'http://www.w3.org/TR/1999/REC-html401-19991224/loose.dtd': true
    }
  },
  '-//W3C//DTD XHTML 1.1//EN': {
    systemIds: {
      'http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd': true
    }
  },
  '-//W3C//DTD XHTML Basic 1.0//EN': {
    systemIds: {
      'http://www.w3.org/TR/xhtml-basic/xhtml-basic10.dtd': true
    }
  },
  '-//W3C//DTD XHTML 1.0 Strict//EN': {
    systemIds: {
      'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd': true
    }
  },
  '-//W3C//DTD XHTML 1.0 Transitional//EN': {
    systemIds: {
      'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd': true
    }
  },
  'ISO/IEC 15445:1999//DTD HyperText Markup Language//EN': {
    systemIds: {
      '': true
    }
  },
  'ISO/IEC 15445:2000//DTD HTML//EN': {
    systemIds: {
      '': true
    }
  },
  'ISO/IEC 15445:1999//DTD HTML//EN': {
    systemIds: {
      '': true
    }
  }
};

// List the difference between IE and WebKit on the interpretion of DTD.
var COMPAT_MODE_DIFF_PUBLIC_ID_MAP = {
  '-//W3C//DTD HTML 4.0 Transitional//EN': {
    systemIds: {
      'http://www.w3.org/TR/html4/loose.dtd': {IE: 'S', WebKit: 'Q'}
    }
  },
  'ISO/IEC 15445:2000//DTD HTML//EN': {
    systemIds: {
      '': {IE: 'Q', WebKit: 'S'}
    }
  },
  'ISO/IEC 15445:1999//DTD HTML//EN': {
    systemIds: {
      '': {IE: 'Q', WebKit: 'S'}
    }
  }
};

var CONDITIONAL_COMMENT_REGEXP = /\[\s*if\s+[^\]][\s\w]*\]/i;

// Check for conditional comments like:
// <!--[if !IE]> HTML <![endif]-->
var NOT_IE_HIDDEN_CONDITIONAL_COMMENT_REGEXP = /^\[if\s+!IE\]>.*<!\[endif\]$/i;

/**
 * <!DOCTYPE "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'">
 * This DTD makes IE render in standards mode, Chrome in quirks mode.
 * Sample URL: http://www.nasa.gov/
 * @param {string} name the name of the doctype in lower case.
 * @param {string} publicId the publicId of the doctype.
 * @param {string} systemId the systemId of the doctype.
 */
function fixDocTypeOfNASA(name, publicId, systemId) {
  if (name ==
      "\"xmlns:xsl='http://www.w3.org/1999/xsl/transform'\"".toLowerCase() &&
      publicId == '' &&
      systemId == '') {
    documentMode.IE = 'S';
    documentMode.WebKit = 'Q';
    documentMode.isUnusualDocType = false;
  }
}

/**
 * Determine if a string is an IE's conditional comment.
 * @param {string} string the nodeValue of the comment node.
 */
function isConditionalComment(nodeValue) {
  return CONDITIONAL_COMMENT_REGEXP.test(nodeValue);
}

/**
 * Determine if a string is a "not IE" downlevel-hidden conditional comment.
 * About conditional comments, refer to:
 * http://msdn.microsoft.com/en-us/library/ms537512(v=vs.85).aspx
 * @param {string} string the nodeValue of the comment node.
 */
function isNotIEHiddenConditionalComment(nodeValue) {
  return NOT_IE_HIDDEN_CONDITIONAL_COMMENT_REGEXP.test(nodeValue);
}

/**
 * Check if there has comment before the doctype, and return an object.
 * @return {object} return an object, the key hasCommentBeforeDTD record if
 *     there has comment before the DTD, the key hasConditionalCommentBeforeDTD
 *     record if there has IE's conditional comment (exclude the "not IE"
 *     downlevel-hidden format) before the doctype.
 */
function checkForCommentBeforeDTD() {
  var result = {
    hasCommentBeforeDTD: false,
    hasConditionalCommentBeforeDTD: false
  };
  var doctype = document.doctype;
  if (!doctype)
    return result;
  // We only consider the previous sibling nodes of the doctype. The nodes
  // (e.g. the comments) between the doctype and the root element do not
  // affect the document mode in all browsers, such as:
  // <!DOCTYPE html>
  // <!-- some text -->
  // <html>
  for (var prev = doctype.previousSibling;
      prev;
      prev = prev.previousSibling) {
    if (prev.nodeType == Node.COMMENT_NODE) {
      var isConditionalComm = isConditionalComment(prev.nodeValue);
      if (!isConditionalComm) {
        result.hasCommentBeforeDTD = true;
        continue;
      }
      // Conditional comments in IE are so complicated, we just consider one
      // situation, if the comments before doctype are all IE's conditional
      // comments with downlevel-hidden !IE expression, There's no difference
      // between IE and Chrome. Such as
      // <!--[if !IE]> some text <![endif]--> 
      // <!DOCTYPE html>
      // Sample URL: http://www.reuters.com/
      if (!isNotIEHiddenConditionalComment(prev.nodeValue)) {
        result.hasConditionalCommentBeforeDTD = true;
      }
    }
  }
  return result;
}

/**
 * Process the result of the doctype detection according to the publicId white
 * list, the compat mode diff map, the result of the comments before the DTD,
 * etc.
 */
function processDoctypeDetectionResult() {
  var doctype = document.doctype;
  var name = doctype ? doctype.name.toLowerCase() : '';
  var publicId = doctype ? doctype.publicId : '';
  var systemId = doctype ? doctype.systemId : '';
  var compatMode = document.compatMode.toLowerCase();
  documentMode.hasDocType = (doctype) ? true : false;
  // Record the exact document mode in WebKit, and suppose that the document
  // mode in IE be the same with in WebKit.
  documentMode.WebKit = (compatMode == 'backcompat') ? 'Q' : 'S';
  documentMode.IE = documentMode.WebKit;
  // If there has no DTD at all, we consider that the documentMode in
  // both IE and Chrome are quirks mode.
  if (!doctype)  {
    return;
  }
  // Record the common doctype's document mode and whether the doctype is
  // unusual.
  if (name != 'html') {
    documentMode.IE = undefined;
    documentMode.isUnusualDocType = true;
  } else {
    if (publicId in PUBLIC_ID_WHITE_LIST) {
      if (!(systemId in PUBLIC_ID_WHITE_LIST[publicId].systemIds)) {
        documentMode.IE = undefined;
        documentMode.isUnusualDocType = true;
      }
    } else {
      documentMode.IE = undefined;
      documentMode.isUnusualDocType = true;
    }
  }
  // Fix the correct document mode in IE accordding to the compat mode diff map.
  if ((publicId in COMPAT_MODE_DIFF_PUBLIC_ID_MAP) &&
      (systemId in COMPAT_MODE_DIFF_PUBLIC_ID_MAP[publicId].systemIds)) {
    documentMode.IE =
        COMPAT_MODE_DIFF_PUBLIC_ID_MAP[publicId].systemIds[systemId].IE;
    // The doctype information in COMPAT_MODE_DIFF_PUBLIC_ID_MAP is not included
    // in PUBLIC_ID_WHITE_LIST, so the isUnusualDocType will be true in the
    // above piece of scripts. Since these DTDs are also common DTDs, we must
    // make it be false again.
    documentMode.isUnusualDocType = false;
  }

  // Fix documentMode according to the special function.
  fixDocTypeOfNASA(name, publicId, systemId);
  // We do not consider the comments before the DTD if the document mode
  // in IE is Quirks Mode.
  if (documentMode.IE != 'Q') {
    var result = checkForCommentBeforeDTD();
    if (result.hasConditionalCommentBeforeDTD) {
      documentMode.IE = undefined;
      documentMode.hasConditionalCommentBeforeDTD = true;
    } else if (result.hasCommentBeforeDTD) {
      // The comment before the doctype declaration makes the doctype be
      // invalid in IE, so IE's document mode become the Quirks Mode. Refer to
      // http://www.w3help.org/zh-cn/causes/HG8001.
      documentMode.IE = 'Q';
      documentMode.hasCommentBeforeDTD = true;
    }
  }
}

processDoctypeDetectionResult();
chrome_comp.documentMode = documentMode;

});
