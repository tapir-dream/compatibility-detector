// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'radio_name',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor


function checkNode(node, context) {

  if (Node.ELEMENT_NODE != node.nodeType)
    return;

  if (node.tagName != 'INPUT')
    return;

  var inputTypeValue = node.getAttribute('type');
  var propertyValueRegExp_ = /^[A-Za-z0-9]$|^[A-Za-z0-9][A-Za-z0-9\-\_\:\b]+$/;
  var inputNameValue = node.getAttribute('name');

  if ( inputTypeValue != 'radio')
    return;

  if ( !propertyValueRegExp_.test(inputNameValue) )
    this.addProblem('HF9009', [node]);

}
); // declareDetector

});
