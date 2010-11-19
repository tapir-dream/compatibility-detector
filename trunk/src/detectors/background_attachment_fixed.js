addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'background_attachment_fixed',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  //检查元素是否是 HTML 或 BODY
  debugger;
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName == "HMTL" || node.tagName =="BODY")
    return;
  //取非 HTML BODY 的 background-attachment 属性
  var background_attachment = chrome_comp.getDefinedStylePropertyByName(node, true, 'background-attachment');
  
  if(background_attachment=="fixed"){
      this.addProblem('RC3002', [node]);
  }
}
); // declareDetector

});
