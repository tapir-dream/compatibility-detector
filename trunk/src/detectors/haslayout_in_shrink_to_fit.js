// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'hasLayoutInShrinkToFit',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有遵循 shrink-to-fit 算法的非替换元素
 * 若其内不存在设定了宽度的子元素则发出警告
 *
 *【缺陷】
 * 很容易触发 WebKit 的过度 shrink-to-fit 的 Bug
 */


function checkNode(node, additionalData) {
  function isWidthAuto(element) {
    var div = document.createElement('div');
    div.style.cssText = 'width:10000000px;height:20px;';
    var dis = element.style.display, tl = element.style.tableLayout,
        oldW = parseInt(chrome_comp.getComputedStyle(element).width),
        blw = parseInt(chrome_comp.getComputedStyle(element).borderLeftWidth),
        brw = parseInt(chrome_comp.getComputedStyle(element).borderRightWidth),
        pl = parseInt(chrome_comp.getComputedStyle(element).paddingLeft),
        pr = parseInt(chrome_comp.getComputedStyle(element).paddingRight);
    element.style.display = 'table !important';
    element.style.tableLayout = 'fixed !important';
    element.appendChild(div);
    var newW = parseInt(chrome_comp.getComputedStyle(element).width);
    element.removeChild(div);
    element.style.display = null;
    element.style.tableLayout = null;
    element.style.display = (dis) ? dis : null;
    element.style.tableLayout = (tl) ? tl : null;
    return oldW != (newW + blw + brw + pl + pr);
  }

  function isShrinkToFit(element) {
    if (!isWidthAuto(element))
      return false;
    var cssFloat = chrome_comp.getComputedStyle(element).float,
        pos = chrome_comp.getComputedStyle(element).position,
        dis = chrome_comp.getComputedStyle(element).display;
    return (pos == 'absolute' || pos == 'fixed') || (cssFloat != 'none') ||
        (dis == 'inline-block');
  }

  function isInlineElement(element) {
    return chrome_comp.getComputedStyle(element).display == 'inline';
  }

  function allWidthAutoLayoutChildren(element) {
    var ch = element.children;
    for (var i = 0, j = ch.length; i < j; i++) {
      if (isInlineElement(element))
        continue;
      if (!isWidthAuto(ch[i]))
        return false;
      if (chrome_comp.hasLayoutInIE(element)) {
        if (!allWidthAutoLayoutChildren(ch[i])) {
          return false;
        }
      }
    }
    return true;
  }

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (chrome_comp.isReplacedElement(node))
    return;

  if (chrome_comp.getComputedStyle(node).display == 'none')
    return;
  
  if (chrome_comp.getComputedStyle(node).display.indexOf('inline') != -1)
    return;

  if (chrome_comp.getComputedStyle(node).display.indexOf('table') != -1)
    return;

  if (!isShrinkToFit(node))
    return;

  if (allWidthAutoLayoutChildren(node))
    this.addProblem('RD8023', [node]);

}
); // declareDetector

});

