// @author : luyuan.china@gmail.com

addScriptToInject(function() {

chrome_comp.CompDetect.declareDetector(

'elementClick',

chrome_comp.CompDetect.NonScanDomBaseDetector,

function constructor(rootNode) {
  var This = this;
  this.click_ = function(result, originalArguments, callStack) {
    if (this.tagName != 'BUTTON' && this.tagName != 'INPUT')
      This.addProblem('SD9025', [this]);
  };
},

function setUp() {
  chrome_comp.CompDetect.registerSimplePropertyHook(
      HTMLElement.prototype, 'click', this.click_);
},

function cleanUp() {
  chrome_comp.CompDetect.unregisterSimplePropertyHook(
      HTMLElement.prototype, 'click', this.click_);
}
); // declareDetector

});
