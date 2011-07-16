/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Build root cause articles for publish.
 */

var DEFAULT_CSDN_FORUM = 'http://forum.csdn.net/SList/CrossBrowser/';

function log(message) {
  console.log(message);
}

var fs = require('fs');

function loadFromFile(filename) {
  return fs.readFileSync(filename, 'utf-8');
}

function saveToFile(filename, text) {
  var fd = fs.openSync(filename, 'w+');
  fs.writeSync(fd, text , 0);
}

var LEADING_WHITESPACES = /^[ \t\r\n]+/;
var TRAILING_WHITESPACES = /[ \t\r\n]+$/;

function trim(s) {
  return s.replace(LEADING_WHITESPACES, '')
          .replace(TRAILING_WHITESPACES, '');
}

function stringTemplate(htmlTemplate, data) {
  // Template format is '${...}'.
  return htmlTemplate.replace(/\${(\w+)}?/g,
      function(str, p1) {
        var value = data[p1];
        return (typeof value == 'string') ? value : str;
      });
}

function processFile(id, sourceDir, destDir) {
  var filePath = sourceDir + id + '.html';
  log(filePath + ' processing...');
  var text = loadFromFile(filePath);
  var data = getTemplateData(text);
  var page = stringTemplate(template, data);
  saveToFile(destDir + id + '.html', page);
  log('The file process finished. ' );
}

function getTemplateData(text, type) {
  var keywordsRegExp = '<!--\\s*keywords\\s*begin\\s*-->\\s*<p>' +
      '([\\w\\W]+?)<\\/p>\\s*<!--\\s*keywords\\s*end\\s*-->';
  keywordsRegExp = new RegExp(keywordsRegExp,'i');

  var titleRegExp =
      /<h1\s+class\=\"title\">([\w\W]*?)<\/h1>/i;
  var tocRegExp =
      /<!--\s*toc\s*begin\s*-->([\w\W]*?)<!--\s*toc\s*end\s*-->/i;
  var w3hcontentRegExp =
      /<!--\s*content\s*begin\s*-->([\w\W]*?)<!--\s*content\s*end\s*-->/i;

  var title = text.match(titleRegExp)[1];
  var toc = text.match(tocRegExp)[1];
  var w3hContent = text.match(w3hcontentRegExp)[1];
  var keywords = getStandardKeyWords(text.match(keywordsRegExp)[1]);

  var data = {
    keywords: keywords,
    title: title,
    toc: toc,
    w3hContent: w3hContent
  };

  // RCA template page need csdnFrum data data.
  if ('RCA' == buildType)  {
    data.csdnForum = getCSDNForumUrl(getRCAId(title));
  }
  // TODO: other template page Special treatment.
  // ...

  return data;
}

function getStandardKeyWords(keywords) {
  if (!keywords)
    return '';
  keywords = trim(keywords);
  keywords = keywords.split(/\s+/);
  if (keywords.length == 0)
    return '';
  return keywords.join(', ');
}

function getRCAId(title) {
  titleId = title.match(/^\s*(\w{2}\d{4}?)/);
  if (!titleId || !titleId[1])
    return;
  return titleId[1];
}

function getCSDNForumUrl(titleId) {
  var url = csdnForumUrlMap[titleId];
  return (!url) ? DEFAULT_CSDN_FORUM : url;
}

var NEW_LINE_CHAR = '\r\n';
var csdnForumUrlMap = {};
function createCSDNForumUrlMap(csdnList) {
  var splitRegExp = /\s+/;
  var lines = csdnList.split(NEW_LINE_CHAR);
  for (var i = 0, c = lines.length; i < c; ++i) {
    var keyAndValue = lines[i].split(splitRegExp);
    csdnForumUrlMap[keyAndValue[0]] = keyAndValue[1];
  }
}

var template;
function loadTemplate(templateFile) {
  template = loadFromFile(templateFile);
}

// RCA is Root Causes page.
// KB is Knowledge Base page.
// CS is Case Studies page.
var BUILD_DEFAULT_CONF = {
  RCA: {
    sourceDir: '..\\w3help\\zh-cn\\causes\\',
    desDir: 'w3help\\zh-cn\\output\\causes\\',
    templateFile: '..\\w3help\\zh-cn\\causes\\template_cause.html',
    idListFile: 'RCA_id_list.txt',
    csdnListFile: 'csdn_list.txt'
  },
  KB: {
    sourceDir: '..\\w3help\\zh-cn\\KB\\',
    desDir: 'w3help\\zh-cn\\output\\KB\\',
    templateFile: '..\\w3help\\zh-cn\\KB\\template_cause.html',
    idListFile: 'KB_id_list.txt'
  },
  CS: {
    sourceDir: '..\\w3help\\zh-cn\\causes\\',
    desDir: 'w3help\\zh-cn\\output\\causes\\',
    templateFile: '..\\w3help\\zh-cn\\causes\\casestudies.html',
    idListFile: 'CS_id_list.txt'
  }
};

var buildType = 'RCA';

function main(type, sourceDir, destDir, templateFile, idListFile, csdnListFile) {
  if (!BUILD_DEFAULT_CONF[type]) {
    log('Error!! Need build param in RCA or KB or CS.');
    return;
  }
  buildType = type;
  if (!sourceDir)
    sourceDir = BUILD_DEFAULT_CONF[type][sourceDir];
  if (!destDir)
    destDir = BUILD_DEFAULT_CONF[type][destDir];
  if (!templateFile)
    templateFile = BUILD_DEFAULT_CONF[type][templateFile];
  if (!idListFile)
    idListFile = BUILD_DEFAULT_CONF[type][idListFile];

  // RCA template page need CSDN froum links.
  if ('RCA' == type && !csdnListFile) {
    csdnListFile = BUILD_DEFAULT_CONF[type][csdnListFile];
    createCSDNForumUrlMap(trim(loadFromFile(csdnListFile)));
  }
  // TODO: other template page Special treatment.
  // ...

  loadTemplate(templateFile);

  var ids = trim(loadFromFile(idListFile)).split(NEW_LINE_CHAR);

  for (var i = 0; i < ids.length; ++i) {
    processFile(ids[i], sourceDir, destDir);
  }
  log('All files process Finished!');
}

// Arguments list:
// 1. build type
// 2. content page directory
// 3. the build directory
// 4. template files path
// 5. id list file path
// 6. csdn forum list file path (RCA page bulid)
//log(process.argv.join())
main(process.argv[2], process.argv[3], process.argv[4],
    process.argv[5], process.argv[6], process.argv[7]);
