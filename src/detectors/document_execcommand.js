// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'documentExecCommandDetector',

chrome_comp.CompDetect.ScanDomBaseDetector,

/*
 *【思路】
 * 包装 document.execCommand 对象，过滤各浏览器兼容的 commands 参数，如果不在此参数列表中用则命中。
 *
 *【缺陷】
 * 如果位于一些逻辑语句后，作者根据命令返回结果判断后调用其他等语句的情况，将无法确保准确性。
 *
 *【messages.json】
 * "BX9054": { "message": "各浏览器对 document.execCommand 方法的首参数可选值范围存在差异"},
 * "BX9054_suggestion": { "message": "在调用 execCommand 方法时建议仅从 \"backColor\" \"bold\" \"createLink\" \"delete\" \"fontSize\" \"foreColor\" \"formatBlock\" \"indent\" \"insertHorizontalRule\" \"insertImage\" \"insertOrderedList\" \"insertUnorderedList\" \"insertParagraph\" \"italic\" \"justifyCenter\" \"justifyLeft\" \"justifyRight\" \"justifyFull\" \"outdent\" \"removeFormat\" \"selectAll\" \"strikeThrough\" \"subscript\" \"superscript\" \"underline\" \"unlink\" 参数中选择其一作为首参数传入，他们均被所有浏览器支持。" },
 *
 */

function constructor(rootNode) {
  var This = this;
   this.execCommandHookHandler_ = function(result, originalArguments, callStack) {
     var commandList = {"backColor":"","bold":"","createLink":"","delete":"","fontSize":"",
                        "foreColor":"","formatBlock":"","indent":"","insertHorizontalRule":"",
			"insertImage":"","insertOrderedList":"","insertUnorderedList":"","insertParagraph":"",
			"italic":"","justifyCenter":"","justifyLeft":"","justifyRight":"","justifyFull":"",
			"outdent":"","removeFormat":"","selectAll":"","strikeThrough":"","subscript":"",
			"superscript":"","underline":"","unlink":""}
     if (originalArguments[0] in commandList) return;
    This.addProblem('BX9054', { nodes: [this], needsStack: true });
  };
},

function checkNode(node, context) {
  if (Node.ELEMENT_NODE != node.nodeType || node.tagName != 'IFRAME' || context.isDisplayNone())
    return;

  chrome_comp.CompDetect.registerExistingMethodHook(
      node.contentWindow.Document.prototype, 'execCommand', this.execCommandHookHandler_);

},

function setUp() {},

function cleanUp() {}

); // declareDetector

});
