// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'documentTypeAndBoxSizing',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * HG8001:
 * 检测 HTML 元素之前是否还存在其他节点，若存在 nodeType = 8 的节点（包括普通注释及 XML 声明），若存在则发出警告。
 * RD8001:
 * 过滤掉 display:none 的元素以及没有明确设定宽度和高度或者 border padding 均为 0 的元素。
 * 过滤掉 TABLE、BUTTON、INPUT[type=button|submit|reset] 元素
 * 通过 document.compatMode 初步检测当前 DTD 在 Chrome 中的文档模式，检测 DTD 是否为那 3 种会使文档模式在 IE 和 Chrome 之中出现差异的 DTD，并更新在 IE 及 Chrome 中的文档模式变量
 * 检测各类元素及是否设定了 box-sizing 特性，若出现了 IE 与 Chrome 中出现文档模式不同的情况，并发出警告
 *
 * 【缺陷】
 * 使文档模式在 IE 和 Chrome 之中出现差异的 DTD 可能不全
 * 在所有文档模式下宽度和高度作用位置没有差异的元素可能不全
 * 由于 CSS 文件跨域可能导致 getDefinedStylePropertyByName 无法得到正确的值
 * 对 box-sizing 特性的判断需要完善
 * 没有考虑作者使用 css hack 时的情况
 */


function checkNode(node, additionalData) {
  function isIEDTDBug(nodeEl) {
    var html = document.documentElement, prev = html;
    while (prev.previousSibling) { prev = prev.previousSibling; }
    if (prev && prev.nodeType == 8) {
      return true;
    }
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  var tn = node.tagName, tp;
  if (window.chrome_comp.getComputedStyle(node).display == 'none')
    return;
  var w = chrome_comp.getDefinedStylePropertyByName(node, true, 'width'),
      h = chrome_comp.getDefinedStylePropertyByName(node, true, 'height'),
      bt = parseInt(chrome_comp.getComputedStyle(node).borderTopWidth),
      br = parseInt(chrome_comp.getComputedStyle(node).borderRightWidth),
      bb = parseInt(chrome_comp.getComputedStyle(node).borderBottomWidth),
      bl = parseInt(chrome_comp.getComputedStyle(node).borderLeftWidth),
      pt = parseInt(chrome_comp.getComputedStyle(node).paddingTopWidth),
      pr = parseInt(chrome_comp.getComputedStyle(node).paddingRightWidth),
      pb = parseInt(chrome_comp.getComputedStyle(node).paddingBottomWidth),
      pl = parseInt(chrome_comp.getComputedStyle(node).paddingLeftWidth);
  if ((!w || w == 'auto') && (!h || h == 'auto'))
    return;
  if (!bt && !br && !bb && !bl && !pt && !pr && !pb && !pl)
    return;

  (tn == 'INPUT') && (tp = node.type.toLowerCase());
  if (tn == 'TABLE' || tn == 'BUTTON' || (tn == 'INPUT' && (tp == 'button' || 
      tp == 'submit' || tp == 'reset'))) {
    return;
  }

  var doctypeInIE, doctypeInWebKit, diffMap,
      pid = (document.doctype) ? document.doctype.publicId : 0,
      sid = (document.doctype) ? document.doctype.systemId : 0,
      cm = document.compatMode.toLowerCase(),
      boxSizing = window.chrome_comp.getComputedStyle(node).webkitBoxSizing;
  doctypeInIE = doctypeInWebKit = (cm == 'backcompat') ? 'Q' : 'S';
  if (isIEDTDBug(node)) {
    doctypeInIE = 'Q';
    if (tn == 'HTML')
      this.addProblem('HG8001', [node]);
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
  if ((tn == 'IMG') && (boxSizing != 'border-box'))
    return;
  if ((tn == 'HR') && (boxSizing == 'border-box'))
    return;
  if (diffMap[pid]) {
    if (diffMap[pid]['systemId'] == sid) {
      doctypeInIE = diffMap[pid]['IE'];
      doctypeInWebKit = diffMap[pid]['WebKit'];
    }
  }
  if (!window.chrome_comp.isReplacedElement(node)) {
    if (doctypeInIE == 'Q' && boxSizing != 'border-box') {
      this.addProblem('RD8001', [node]);
      return;
    }
    if (doctypeInIE == 'S' && boxSizing == 'border-box') {
      this.addProblem('RD8001', [node]);
      return;
    }
  } else {
    if (((tn == 'INPUT' && (tp == 'text' || tp == 'password')) || 
        (tn == 'TEXTAREA')) && (doctypeInIE != doctypeInWebKit)) {
      if (doctypeInIE == 'Q' && boxSizing != 'border-box')
        this.addProblem('RD8001', [node]);
      return;
    }
    if (tn == 'IFRAME' && doctypeInIE == 'Q') {
      this.addProblem('RD8001', [node]);
      return;
    }
  }
}
); // declareDetector

});