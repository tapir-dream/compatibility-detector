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
  WScript.Echo(message);
}

// These ADODB.Stream object constants should be consistent
// to MS's definition, do not use CONSTANT_VAR coding style here.
var adReadAll = -1;
var adReadLine = -2;
var adTypeBinary = 1;
var adTypeText = 2;
var adSaveCreateNotExist = 1;
var adSaveCreateOverWrite = 2;

/**
 * Reference
 * Stream Object Properties, Methods, and Events
 * http://msdn.microsoft.com/en-us/library/ms677486(v=vs.85).aspx
 */
function saveToFile(filename, text) {
  var stream = new ActiveXObject('ADODB.Stream');
  try{
    stream.Open();
    stream.Charset = 'utf-8';
    stream.WriteText(text);
    stream.SaveToFile(filename, adSaveCreateOverWrite);
    removeBOM(filename);
  } catch(exception) {
    log(exception.message)
  } finally {
    stream.Close();
    stream = null;
  }
}

/**
 * Reference
 * ReadText Method
 * http://msdn.microsoft.com/en-us/library/ms678077(v=vs.85).aspx
 */
function loadFromFile(filename) {
  var stream = new ActiveXObject('ADODB.Stream');
  try {
    stream.Open();
    stream.Charset = 'utf-8';
    stream.LoadFromFile(filename);
    var text = stream.ReadText(adReadAll);
  } catch(exception) {
    log(exception.message)
  } finally {
    stream.Close();
    stream = null;
  }
  return text;
}

function removeBOM(filename){
  try {
    var stream = new ActiveXObject("ADODB.Stream");
    stream.Type = adTypeBinary;
    stream.Open();
    stream.LoadFromFile(filename);
    stream.Position = 3; // ignore first 3 bytes (UTF-8 BOM)
    var byteArr = stream.Read(adReadAll);
    stream.Close();
    stream.Open();
    stream.Write(byteArr);
    stream.SaveToFile(filename, adSaveCreateOverWrite);
    stream.Flush();
  } catch(exception) {
    log(exception.message);
  } finally {
    stream.Close();
    stream = null;
  }
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

function getTemplateData(text) {
  var keywordsRegExp = '<!--\\s*keywords\\s*begin\\s*-->\\s*<p>' +
    '([\\w\\W]+?)<\\/p>\\s*<!--\\s*keywords\\s*end\\s*-->';
  keywordsRegExp = new RegExp(keywordsRegExp,'i');
  var titleRegExp =
      /<h1\s+class\=\"title\">([\w\W]*?)<\/h1>/i;
  var tocRegExp =
      /<!--\s*toc\s*begin\s*-->([\w\W]*?)<!--\s*toc\s*end\s*-->/i;
  var w3hcontentRegExp =
      /<!--\s*content\s*begin\s*-->([\w\W]*?)<!--\s*content\s*end\s*-->/i;

  var keywords = getStandardKeyWords(text.match(keywordsRegExp)[1]);
  var title = text.match(titleRegExp)[1];
  var toc = text.match(tocRegExp)[1];
  var w3hContent = text.match(w3hcontentRegExp)[1];
  var csdnForum = getCSDNForumUrl(getRCAId(title));

  var data = {
    csdnForum: csdnForum,
    keywords: keywords,
    title: title,
    toc: toc,
    w3hContent: w3hContent
  };
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

function main(sourceDir, destDir, templateFile, idListFile, csdnListFile) {
  if (!sourceDir)
    sourceDir = '..\\w3help\\zh-cn\\causes\\';
  if (!destDir)
    destDir = 'w3help\\zh-cn\\output\\';
  if (!templateFile)
    templateFile = '..\\w3help\\zh-cn\\causes\\template_cause.html';
  if (!idListFile)
    idListFile = 'id_list.txt';
  if (!csdnListFile)
    csdnListFile = 'csdn_list.txt';

  loadTemplate(templateFile);
  createCSDNForumUrlMap(trim(loadFromFile(csdnListFile)));
  var ids = trim(loadFromFile(idListFile)).split(NEW_LINE_CHAR);

  for (var i = 0; i < ids.length; ++i) {
    processFile(ids[i], sourceDir, destDir);
  }
  log('All files process Finished!');
}

// Arguments list:
// 1. content page directory
// 2. the build directory
// 3. template files path
// 4. id list file path
// 5. csdn forum list file path
main(WScript.Arguments(0), WScript.Arguments(1), WScript.Arguments(2),
    WScript.Arguments(3), WScript.Arguments(4));
