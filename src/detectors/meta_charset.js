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
 * @fileoverview Check The META Tag charset and page charset, Whether the set
 * of pure conflict.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=146
 *
 * test page META tags charset settings, comparison of these strings with
 * the document.characterSet string, if different, then is a problem.
 *
 * document.charset returns the charset current doc uses.
 * when http header specifies charset, doc uses this charset as a priority.
 * if there is not charset in http header, then try meta,
 * if meta tags don't define charset, will use auto-detect if user allows it,
 * otherwise use charset of current UI locale.
 *
 * Defects:
 * HTTP header of the page character encoding is not set,
 * the browser will use the page character encoding of META tag,
 * this time, the page file charset and META setting charset different
 * will not be detected.
 *
 */

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'meta_charset',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor() {
  // Fix charset is GB2312 to GBK or other more exceptions.
  this.charsetStringFix = function(charsetString) {
    charsetString = charsetString.toUpperCase();
    var fixList = {GB2312: 'GBK'};
    if (charsetString in fixList)
      charsetString = fixList[charsetString];
    return charsetString.toUpperCase();
  };
},

function postAnalyze() {
  // Get all HTML 4 and HTML 5 charset of META Tag.
  var metaOfCharsetList =
      document.querySelectorAll('meta[content*="charset="],meta[charset]');
  // Converted nodeList to JavaScript Array.
  metaOfCharsetList = Array.prototype.slice.call(metaOfCharsetList);
  // Fix show same the charsets in page view.
  var actualUseCharset = this.charsetStringFix(document.characterSet);

  var charsetStringRegExp = /charset=([\w\-\_]+)/i;
  var charsetMap = {};

  // Filled the total number data of charset
  for (var i = 0, c = metaOfCharsetList.length; i < c; ++i) {
    var metaElement = metaOfCharsetList[i];
    // Get charset values in chearset attribute of META Tag (HTML5).
    var currentMetaCharset = metaElement.getAttribute('charset');
    if (currentMetaCharset) {
      charsetMap[currentMetaCharset.toUpperCase()] = true;
    }
    // Get charset values in content attribute of META Tag (HTML4).
    currentMetaCharset = metaElement.getAttribute('content');
    if (currentMetaCharset) {
      currentMetaCharset = currentMetaCharset.match(charsetStringRegExp)[1];
      if (currentMetaCharset)
         charsetMap[currentMetaCharset.toUpperCase()] = true;
    }
  }
  var charsetKeys = Object.keys(charsetMap);

  var standardCharsetStringMap = {};
  // charsetStringStandardizedHelper function callback
  for (var i = 0, len = charsetKeys.length; i < len; ++i) {
    var standardCharsetString = this.charsetStringFix(charsetKeys[i]);
    standardCharsetStringMap[standardCharsetString] = true;
  }

  charsetKeys = Object.keys(standardCharsetStringMap);
  // If standard charset value list count is more than 1,
  // charset set conflict.
  if (charsetKeys.length > 1 ||
      charsetKeys[0] != actualUseCharset) {
    for (var i = 0, len = metaOfCharsetList.length; i < len; ++i) {
      this.addProblem('HR9001', {
        nodes: [metaOfCharsetList[i]],
        details: 'actual Use Charset: ' + actualUseCharset +
            '\nMeta Charset: ' + charsetKeys.join(', '),
        severityLevel: 1
      });
    }
  };
}
); // declareDetector

});
