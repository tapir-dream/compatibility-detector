// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'imgIframeObjectEmbedBaseline',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*【思路】
 * 得到当前页面在 IE6 IE7 IE8 及 Chrome 中的文档模式，包括 Almost Standards Mode
 * 判断当前替换元素所在的包含块是否还存在其他内容，若是则退出
 * 判断是否存在空白节点，根据具体情况发出警告
 *
 *【缺陷】
 * 仅考虑了 IE 和 Chrome 之间的差异
 */


function constructor(rootNode) {
  function getMode() {
    function isIEDTDBug() {
      var html = document.documentElement, prev = html;
      while (prev.previousSibling) { prev = prev.previousSibling; }
      if (prev && prev.nodeType == 8) {
        return true;
      }
    }

    function hasBase() {
      var iframe = document.createElement('iframe');
      var div = document.createElement('div');
      div.appendChild(iframe);
      document.documentElement.appendChild(div);
      n = div.offsetHeight == iframe.offsetHeight;
      document.documentElement.removeChild(div);
      return !n;
    }

    var doctypeInIE6;
    var doctypeInIE7;
    var doctypeInIE8;
    var doctypeInWebKit;
    var diffMap;
    var pid = (document.doctype) ? document.doctype.publicId : 0;
    var sid = (document.doctype) ? document.doctype.systemId : 0;
    var qk = chrome_comp.inQuirksMode();
    doctypeInWebKit = (qk) ? 'Q' : 'S';
    doctypeInIE = doctypeInWebKit;
    if (isIEDTDBug()) {
      doctypeInIE6 = 'Q';
      doctypeInIE7 = 'Q';
      doctypeInIE8 = 'Q';
    }
    diffMap = {
      "-//W3C//DTD HTML 4.0 Transitional//EN": { 
        "systemId": "http://www.w3.org/TR/html4/loose.dtd",
        "IE": "S",
        "WebKit": "Q"
      },
      "ISO/IEC 15445:2000//DTD HTML//EN": {
        "systemId": "",
        "IE": "Q",
        "WebKit": "S"
      },
      "ISO/IEC 15445:1999//DTD HTML//EN": {
        "systemId": "",
        "IE": "Q",
        "WebKit": "S"
      }
    }
    if (diffMap[pid]) {
      if (diffMap[pid]['systemId'] == sid) {
        doctypeInIE6 = diffMap[pid]['IE'];
        doctypeInIE7 = diffMap[pid]['IE'];
        doctypeInIE8 = diffMap[pid]['IE'];
        doctypeInWebKit = diffMap[pid]['WebKit'];
      }
    }
    if (hasBase()) {
      if (doctypeInWebKit != 'Q') {
        doctypeInWebKit = 'S';
      }
      if (doctypeInIE8 != 'Q') {
        doctypeInIE8 = 'S';
      }
    } else {
      if (doctypeInWebKit != 'Q') {
        doctypeInWebKit = 'A';
      }
      if (doctypeInIE8 != 'Q') {
        doctypeInIE8 = 'A';
      }
    }
    if (doctypeInIE6 != 'Q')
      doctypeInIE6 = 'A';
    if (doctypeInIE7 != 'Q')
      doctypeInIE7 = 'A';
    return { 
      IE6 : doctypeInIE6, 
      IE7 : doctypeInIE7, 
      IE8 : doctypeInIE8, 
      WebKit : doctypeInWebKit 
    };
  }
  this.documentMode = getMode();
//alert('WebKit:' + this.documentMode.WebKit + '\nIE6:' + this.documentMode.IE6 + '\nIE7:' + this.documentMode.IE7 + '\nIE8:' + this.documentMode.IE8);return;
},

function checkNode(node, context) {
  function hasTextNode(element) {
    var txt = element.parentNode.innerText;
    var reWS = /^\w+$/g;
    return element.parentNode.innerText != '';
  }

  function hasEmptyNode(element) {
    return element.parentNode.childNodes.length > 1;
  }

  function isOnlyChild(element) {
    var parent = element.parentNode;
    var dis = element.style.display;
    element.style.display = 'none !important';
    var h = parseInt(chrome_comp.getComputedStyle(element).height);
    element.style.display = null;
    element.style.display = (dis) ? dis : null;
    return !h;
  }

  function isBaseline(element) {
    return chrome_comp.getComputedStyle(element).verticalAlign == 'baseline';
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tagList = ['IMG', 'IFRAME', 'OBJECT', 'EMBED'];
  if (tagList.indexOf(node.tagName) == -1)
    return;

  if (!isBaseline(node))
    return;

  if (!isOnlyChild(node))
    return;

  if (hasTextNode(node))
    return;

  var mode = this.documentMode;
  var hasEmptyNoWarnning = {
    IE6 : 'SAQ',
    IE7 : 'SAQ',
    IE8 : 'SQ',
    WebKit : 'S'
  };
  var hasNoEmptyNoWarnning = {
    IE6 : 'SAQ',
    IE7 : 'SAQ',
    IE8 : 'AQ',
    WebKit : 'AQ'
  }

  if (hasEmptyNode(node)) {
    if ((hasEmptyNoWarnning.IE6.indexOf(mode.IE6) == -1) || 
        (hasEmptyNoWarnning.IE7.indexOf(mode.IE7) == -1) || 
        (hasEmptyNoWarnning.IE8.indexOf(mode.IE8) == -1) || 
        (hasEmptyNoWarnning.WebKit.indexOf(mode.WebKit) == -1))
      this.addProblem('RD3020', [node]);
  } else {
    if ((hasNoEmptyNoWarnning.IE6.indexOf(mode.IE6) == -1) || 
        (hasNoEmptyNoWarnning.IE7.indexOf(mode.IE7) == -1) || 
        (hasNoEmptyNoWarnning.IE8.indexOf(mode.IE8) == -1) || 
        (hasNoEmptyNoWarnning.WebKit.indexOf(mode.WebKit) == -1))
      this.addProblem('RD3020', [node]);
  }
}
); // declareDetector

});

