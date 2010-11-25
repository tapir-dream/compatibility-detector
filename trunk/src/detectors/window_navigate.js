// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'windowNavigateDetector',

chrome_comp.CompDetect.NonScanDomBaseDetector,

/*
 *【思路】
 * 包装 window.navigate 对象，如果调用则命中。
 *
 *【缺陷】
 * 如果位于 try catch 等语句内则无法确保准确性。
 *
 *【messages.json】
 * "BX9052": { "message": "IE6 IE7 IE8 不会忽略数组直接量的末尾空元素"},
 * "BX9052_suggestion": { "message": "数组直接量的最后不要出现 \",\"字符，以保证兼容各浏览器。" },
 *
 */

function constructor(rootNode) {
  var This = this;
   this.navigateHookHandler_ = function(result, originalArguments, callStack) {
    This.addProblem('BX9052', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      window, 'navigate', this.navigateHookHandler_);

},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      window, 'navigate', this.navigateHookHandler_);
}
); // declareDetector

});
