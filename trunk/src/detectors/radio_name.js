// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'inputTypeIsRadioDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

null, // constructor

/*【思路】
 * 检测所有INPUT[type=radio]标记，如果被其 name 值不符合 CDATA 正则表达式则命中
 *
 *【messages.json】
 * "HF9009": { "message": "各浏览器对表单元素单选按钮组设置非 CDATA 标准的 name 属性值解析不同" },
 * "HF9009_suggestion": { "message": "单选按钮的 \"name\" 属性值必须以字母 ([A-Za-z])和数字（[0-9]）开头 ，其后由任何字母、数字、连字符(\"-\")、下划线(\"_\")、冒号(\":\")和句号 (\".\") 组成。" },
 */

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
