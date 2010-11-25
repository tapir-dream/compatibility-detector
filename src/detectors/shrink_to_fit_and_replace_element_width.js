// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'shrinkToFitAndReplaceElementWidth',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*
 *【思路】
 * 检测所有标记，过滤出标记为替换元素(+MARQUEE)，
 * 如果 INPUT SELECT BUTTON IFRAME IMG OBJECT 的设置宽度为百分比，或者是未设定宽度的 MARQUEE 元素，则查找他们的父元素。
 * 如果他们父元素为 isShrikToFit ，则命中。
 *
 *【缺陷】
 *首先此检测依赖 chrome_comp.isShrinkToFit 方法的准确性，
 *以及 chrome_comp.getDefinedStylePropertyByName 方法准确性，
 *现已知 getDefinedStylePropertyByName 方法存在样式跨域获取问题，导致 isShrinkToFit 方法判断可能不准确。
 *
 *【messages.json】
 * "RD1021": { "message": "各浏览器中当容器元素 shrink-to-fit 时容器内 MARQUEE 标签的计算宽度不一致"},
 * "RD1021_suggestion": { "message": "给 MARQUEE 元素定义具体的宽度，保证各浏览器兼容。"},
 *
 */

function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  //filter non-replace element
  if ( !chrome_comp.isReplacedElement(node) && node.tagName != 'MARQUEE')
    return;

  var parentElement,elementWidth;

  //detector marquee element
  if ( node.tagName == 'MARQUEE' ){
     elementWidth = chrome_comp.getDefinedStylePropertyByName(node, false, 'width');
     if ( elementWidth != undefined ) return;
     if ( !chrome_comp.isShrinkToFit(getParentElement(node)) ) return;

     //Hit the target!
     this.addProblem('RD1021', [node]);
     return;
  }

  //detector replace element element
  elementWidth = chrome_comp.getDefinedStylePropertyByName(node, false, 'width');
  if ( elementWidth == undefined ) return ;
  if ( elementWidth.toString().slice(-1) != "%" ) return;
  if ( !chrome_comp.isShrinkToFit(getParentElement(node)) ) return;

  //Hit the target!
  this.addProblem('RD1021', [node]);
  return;

  function getParentElement(node){
    var parentNode = node.parentNode;
    while (parentNode.nodeType != 1){
      parentNode = node.parentNode;
    }
    return parentNode;
  }
}
); // declareDetector

});
