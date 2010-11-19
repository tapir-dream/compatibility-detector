addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'button_type_form',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

function checkNode(node, additionalData) {
  //检查所有 BUTTON 元素
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'BUTTON')
    return;
  //检查 BUTTON 元素的 form 属性是否存在，若存在说明 BUTTON 在 FORM 中
  if(node.form!=null){
    this.addProblem('HF9015', [node]);
  }
  
}
); // declareDetector

});