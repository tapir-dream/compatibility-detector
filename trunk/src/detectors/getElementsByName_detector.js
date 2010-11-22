// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'getElementsByNameDetector',

chrome_comp.CompDetect.NonScanDomBaseDetector,

/*
 *【思路】
 * 包装 getElementsByName 对象，如果调用, 使用 querySelectorAll("*[name=sName]") 得到所有元素节点，
 * 依次循环 判断 getAttribute(name) 是否与首参数相同，如果没有找到则命中。
 *
 *【messages.json】
 * "SD9012": { "message": "IE6 IE7 IE8 中 getElementsByName 方法的参数不区分大小写"},
 * "SD9012_suggestion": { "在使用 document.getElementsByName 方法获取页面元素时，应保证作为参数的 name 与目标元素的实际 name 值完全一致。" },
 *
 */

function constructor(rootNode) {
  var This = this;

  this.getElementsByNameHandle_ = function(result, originalArguments, callStack) {
    var selectedElements = document.querySelectorAll("*[name="+originalArguments[0]+"]");
    if (selectedElements.length === 0)
      This.addProblem('SD9012', { nodes: [this], needsStack: true });
  };

},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      document, 'getElementsByName', this.getElementsByNameHandle_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      document, 'getElementsByName', this.getElementsByNameHandle_);
}
); // declareDetector

});
