// @author : qianbaokun@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'setTimeoutSetIntervalDetector',

chrome_comp.CompDetect.NonScanDomBaseDetector,

/*
 *【思路】
 * 包装 window.setTimeout 和 window.setInterval 对象，如果调用, 分析第二参数是否为负数、Infinity 和 大于2的32次方，如果是则命中。
 *
 *【messages.json】
 * "BX9011": { "message": "各浏览器对 setTimeout 方法传入时间参数的某些极端值的处理存在差异"},
 * "BX9011_suggestion": { "message": "明确使用 setTimeout 方法的意义，若不希望代码被执行则应通过其他方法达到类似的效果，而不能依赖于为 setTimeout 方法设定极端的时间参数；负数的时间参数是无意义的，应避免使用，若希望代码在当前执行流完成后立即执行，则应设定 0 作为参数。" },
 *
 */

function constructor(rootNode) {
  var This = this;
  this.checkParam = function (param){
    return /\d+/.test(param)
	   && param != Infinity
	   && param >= 0
	   && param < 2147483648 ;
  }

  this.getTimeoutHandle_ = function(result, originalArguments, callStack) {
    if (This.checkParam(originalArguments[1])) return ;
    This.addProblem('BX9011', { nodes: [this], needsStack: true });
  };

  this.getIntervalHandle_ = function(result, originalArguments, callStack) {
    if (This.checkParam(originalArguments[1])) return ;
    This.addProblem('BX9011', { nodes: [this], needsStack: true });
  };
},

function setUp() {
  chrome_comp.CompDetect.registerExistingMethodHook(
      window, 'setTimeout', this.getTimeoutHandle_);
  chrome_comp.CompDetect.registerExistingMethodHook(
      window, 'setInterval', this.getIntervalHandle_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window, 'setTimeout', this.getTimeoutHandle_);
  chrome_comp.CompDetect.unregisterExistingMethodHook(
      window, 'setInterval', this.getIntervalHandle_);
}
); // declareDetector

});
