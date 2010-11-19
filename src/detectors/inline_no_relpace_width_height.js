addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'inline_no_relpace_width_height',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  //检查页面是否是混杂模式，如果是标准模式，则返回
  if(document.compatMode=="CSS1Compat"){
    return;
  }
  //检查元素是否是 行内非替换元素
  if (Node.ELEMENT_NODE != node.nodeType || !chrome_comp.isInlineNoReplacedElement(node))
    return;
  //行内非替换元素 宽度和高度
  var width = chrome_comp.getDefinedStylePropertyByName(node, true, 'width');
  var height = chrome_comp.getDefinedStylePropertyByName(node, true, 'height');
  //检查当前 行内非替换元素 宽度和高度是否存在，若存在
  if((width && width != 'auto') || (height && height != 'auto')){
    //检查计算后样式 是否是block，若是，则说明position是absolute或fixed，float是left或right，代替下面后两种情况
    var display=chrome_comp.getComputedStyle(node).display;
    //检查display是否是block，检查position是否是absolute或fixed，float是否left或right
	/*
    var display = chrome_comp.getDefinedStylePropertyByName(node, true, 'display');
    var position = chrome_comp.getDefinedStylePropertyByName(node, true, 'position');
    var floatCss = chrome_comp.getDefinedStylePropertyByName(node, true, 'float');
	*/
    //debugger; 浮动 定位 是否可以由计算后样式display:block 代替
    //if(display!="block" && position!="absolute" && position!="fixed" && floatCss!="left" && floatCss!="right" )
    //debugger;
	if(display == "inline"){
      this.addProblem('RD1014', [node]);
    }
  }
}
); // declareDetector

});