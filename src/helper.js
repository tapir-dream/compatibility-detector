/**
 * Helper functions
 */

function stringTemplate(htmlTemplate, data) {
  // Template format is '${...}'.
  return htmlTemplate.replace(/\${(\w+)}?/g,
      function(str, p1) {
        var value = data[p1];
        return (typeof value == 'string') ? value : str;
      });
}

function $(id) {
  return document.getElementById(id);
}

function bulidHTMLView(templateData, element) {
  var htmlTemplate = element.innerHTML;
  element.innerHTML = stringTemplate(htmlTemplate, templateData);
}

function getMessages(ids) {
  var result = {};
  for (var i = 0, c = ids.length; i < c; ++i) {
    var id = ids[i];
    result[id] = chrome.i18n.getMessage(id);
  }
  return result;
}