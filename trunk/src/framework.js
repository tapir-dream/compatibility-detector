/*
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

addScriptToInject(function() {

window.chrome_comp = (function() {
  var targetPageURL_ = window.location;
  // >=0 if hook is enabled.
  var hookDisabledCount_ = 0;

  var messageCache_ = { };

  const BLOCK_DISPLAY_VALUES = {
    'block' : true,
    'inline-block' : true,
    'list-item' : true,
    'table' : true,
    'inline-table' : true,
    'table-cell' : true,
    'table-caption' : true
  };

  return {

  COLOR_TRANSPARENT : 'rgba(0, 0, 0, 0)',

  WHITESPACE : /[ \t\r\n]/,
  LEADING_WHITESPACES : /^[ \t\r\n]+/,
  TRAILING_WHITESPACES : /[ \t\r\n]+$/,

  // cache Node reference
  Node : window.Node,

  enableHooks : function(enable) {
    hookDisabledCount_ += (enable ? 1 : -1);
  },

  areHooksDisabled : function() {
    return hookDisabledCount_ < 0;
  },

  // Uses it to prompt debug message.
  trace : function(msg) {
    if (chrome_comp.CompDetectorConfig.canTraceBug) {
      console.log(new Date().getTime() + ' $comp-detect for : ' +
          chrome_comp.getTargetPageURL() + '$');
      console.log(msg);
    }
  },

  // Uses it to implement inherit logic in JavaScript
  extend : function(subClass, superClass) {
    // Use prototype chain to inherit baseClass's method.
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;

    subClass.superclass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
      superClass.prototype.constructor = superClass;
    }
  },

  clone : function(object) {
    function StubObj() { }
    StubObj.prototype = object;
    var newObj = new StubObj();
    newObj.chrome_comp_getInternalObject = function() {
      return this.__proto__;
    }
    newObj.toString = function() {
      try {
        return this.__proto__.toString();
      } catch (e) {
        return 'object Object';
      }
    }
    return newObj;
  },

  ellipsize : function(string, maxLength) {
    return string ? (string.length > maxLength ?
                     string.substring(0, maxLength - 3) + '...' : string)
                  : '';
  },

  /**
   * Trim leading and trailing white spaces. It differs from String.trim()
   * that this function doesn't trim non-breakable spaces (\xA0).
   */
  trim : function(s) {
    return s.replace(chrome_comp.LEADING_WHITESPACES, '')
            .replace(chrome_comp.TRAILING_WHITESPACES, '');
  },

  /**
   * Send a request to the content script. The content script uses
   * document.documentElement.addEventListener(name, function()...) to
   * listen to the request. The parameters and result are passed with
   * attributes of document.documentElement.
   */
  sendRequest : function(name, params, resultName) {
    var event = document.createEvent('Event');
    event.initEvent(name, true, true);
    if (params) {
      for (var i in params) {
        if (params[i] != undefined)
          document.documentElement.setAttribute(i, params[i]);
      }
    }
    document.documentElement.dispatchEvent(event);
    if (params) {
      for (var i in params)
        document.documentElement.removeAttribute(i);
    }
    if (resultName) {
      var result = document.documentElement.getAttribute(resultName);
      document.documentElement.removeAttribute(resultName);
      return result;
    }
  },

  getMessage : function(name, params) {
    var result;
    if (!params) {
      result = messageCache_[name];
      if (result)
        return result;
    }

    result = chrome_comp.sendRequest('chrome_comp_getMessage', {
      chrome_comp_messageName : name,
      chrome_comp_messageParams : JSON.stringify(params)
    }, 'chrome_comp_messageResult');

    if (!params)
      messageCache_[name] = result;
    return result;
  },

  /**
   * Dumps the current calling stack, stripping out all frames that are in
   * detector injected code.
   */
  dumpStack : function() {
    // Disable hooks during dumpStack() because Error.stack might enumerate
    // properties which will trigger some property hook.
    chrome_comp.enableHooks(false);
    try {
      var stack = new Error().stack;
      var pos = stack.lastIndexOf('chrome_comp_injector');
      var pos1 = stack.indexOf('\n', pos);
      return pos1 == -1 ? '' : stack.substring(pos1 + 1);
    } finally {
      chrome_comp.enableHooks(true);
    }
  },

  getSourceAndLine : function(stack) {
    stack = stack || chrome_comp.dumpStack();
    var r = /at .*:[0-9]+(?=:[0-9]+)/.exec(stack);
    return r ? r[0].replace(/^at /, '') : null;
  },

  /**
   * Don't directly use Error.stack because it will cause recursive property
   * hooks. Use this function instead.
   */
  printError : function(message, e) {
    if (!e)
      e = new Error();
    chrome_comp.enableHooks(false);
    try {
      chrome_comp.trace(message + (e.stack || e));
    } finally {
      chrome_comp.enableHooks(true);
    }
  },

  /**
   * Check if a call stack is called directly or indirectly from an extension.
   */
  isCalledFromExtension : function(stackDump) {
    return (stackDump || chrome_comp.dumpStack()).
        indexOf('chrome-extension://') >= 0;
  },

  getCallSite : function(stackDump) {
    if (!stackDump)
      stackDump = chrome_comp.dumpStack();
    var pos = stackDump.indexOf('\n', pos);
    return pos == -1 ? stackDump : stackDump.substring(0, pos);
  },

  setPropertyIfNeed : function(obj, property, value) {
    if (typeof obj[property] == 'undefined')
      obj[property] = value;
  },

  filterFunctionCallStackByFunctionSignature : function(initialCallStack,
                                                        functionSignature) {
    var currentCallStack = initialCallStack;
    var i = 0;
    var caller, callerContent;
    while (currentCallStack.caller) {
      if (i > 20) {
        chrome_comp.trace('caller checking stack overflow: ' + callerContent);
        break;
      }
      try {
        caller = currentCallStack.caller;
        callerContent = caller.toString();
        // When found the call is called by some library, we ignore this
        // call.
        if (callerContent.search(functionSignature) > -1) {
          return true;
        }
      } catch (e) {
        chrome_comp.printError('trace caller stack error: ', e);
      }
      currentCallStack = caller.arguments.callee;
      i++;
    }
    return false;
  },

  getTargetPageURL : function() {
    return targetPageURL_;
  },

  nodeContents : function(node) {
    // TODO: avoid using outerHTML to improve performance.
    if (this.Node.ELEMENT_NODE == node.nodeType)
      return node.outerHTML;
    else if (this.Node.TEXT_NODE == node.nodeType)
      return node.nodeValue;
    else
      return node.toString();
  },

  getAttributeLowerCase : function(ele, name) {
    if (!ele || !name || Node.ELEMENT_NODE != ele.nodeType)
      return null;
    var value = ele.getAttribute(name);
    return value ? value.toLowerCase() : value;
  },

  getComputedStyle : function(ele) {
    if (!ele)
      return;
    var computedStyle = ele.chrome_comp_computedStyleCache;
    if (computedStyle)
      return computedStyle;
    try {
      computedStyle = ele.ownerDocument.defaultView.getComputedStyle(ele, '');
      ele.chrome_comp_computedStyleCache = computedStyle;
      return computedStyle;
    } catch (e) {
      chrome_comp.printError('getComputedStyle error: ', e);
      chrome_comp.trace(ele);
    }
  },

  // Note: for scan dom detectors, please use context.isDisplayNone() in
  // checkNode() instead of this function to improve performance.
  isElementTrulyDisplayable : function(ele) {
    var ownerDocument = ele.ownerDocument;
    var body = ownerDocument.body;
    if (!body)
      return false;
    var bodyStyle = chrome_comp.getComputedStyle(body);
    if (bodyStyle.display == 'none')
      return false;
    while (ele) {
      if (ele == ownerDocument)
        return false;
      if (ele == body)
        return true;
      var eleStyle = chrome_comp.getComputedStyle(ele);
      if (eleStyle.display == 'none')
        return false;
      ele = ele.parentNode;
    }
    return false;
  },

  startsBlockBox : function(node) {
    if (!node)
      return false;
    var style = chrome_comp.getComputedStyle(node);
    return style && BLOCK_DISPLAY_VALUES.hasOwnProperty(style.display);
  },

  startsNewLine : function(node) {
    if (!node)
      return false;
    if (node.tagName == 'BR')
      return true;
    var style = chrome_comp.getComputedStyle(node);
    if (!style)
      return false;
    var display = style.display;
    return display == 'block' || display == 'table' || display == 'list-item';
  },

  getContainingBlock: function(node) {
    if (Node.ELEMENT_NODE != node.nodeType)
      node = node.parentNode;
    if (Node.ELEMENT_NODE != node.nodeType)
      return document.body;
    switch (chrome_comp.getComputedStyle(node).position) {
      case 'fixed':
        return document.body;
      case 'absolute':
        return node.offsetParent;
      default:
        for (var parent = node.parentNode; Node.ELEMENT_NODE == parent.nodeType;
             parent = parent.parentNode) {
          if (chrome_comp.getComputedStyle(parent).display == 'block')
            return parent;
        }
        return document.body;
    }
  },

  /**
   * Determines if a node is a shrink-to-fit container element.
   */
  isShrinkToFit : function(node, checkActuallyShrunk) {
    if (!node || Node.ELEMENT_NODE != node.nodeType)
      return false;

    var style = chrome_comp.getComputedStyle(node);
    var display = style.display;
    if (display == 'none' || display == 'inline' || display == 'inline-table' ||
        display == 'table')
      return false;

    var definedWidth = chrome_comp.getDefinedStylePropertyByName(node, false,
        'width');
    if (definedWidth && definedWidth != 'auto')
      return false;

    var result = undefined;
    if (style.display == 'inline-block') {
      result = true;
    } else if (style.float != 'none') {
      result = true;
    } else if (style.position == 'fixed' || style.position == 'absolute') {
      var definedLeft = chrome_comp.getDefinedStylePropertyByName(node,
          false, 'left');
      if (!definedLeft || definedLeft == 'auto') {
        result = true;
      } else {
        var definedRight = chrome_comp.getDefinedStylePropertyByName(node,
            false, 'right');
        result = !definedRight || definedRight == 'auto';
      }
    }
    if (result === undefined)
      return chrome_comp.isShrinkToFit(node.parentNode);
    if (result && checkActuallyShrunk) {
      // FIXME: This is not accurate.
      return node.offsetWidth !=
             chrome_comp.getContainingBlock(node).offsetWidth;
    }
    return result;
  },

  /**
   * Returns style information that is defined on specified node (including
   * inline style).
   * @param {object} node node to get prorotypes for.
   * @param {boolean} authorOnly Determines whether only author styles need to
   *     be added.
   * @return {object} Style collection descriptor.
   */
  getNodeDefinedStyles : function(node, authorOnly) {
    if (node.nodeType != this.Node.ELEMENT_NODE)
      return [];
    var macthedCSSStyles = [];
    var stylesPerRule;
    var matchedRules = node.ownerDocument.defaultView.getMatchedCSSRules(
        node, '', authorOnly);
    if (matchedRules) {
      for (var i = 0, c = matchedRules.length; i < c; ++i) {
        var rule = matchedRules[i];

        var ruleStyle = rule.style;
        stylesPerRule = {};
        for (var j = 0, c1 = ruleStyle.length; j < c1; ++j) {
          var name = ruleStyle[j];
          stylesPerRule[name] = ruleStyle.getPropertyValue(name);
        }
        macthedCSSStyles.push(stylesPerRule);
      }
    }
    // Get inline style
    var inlineStyle = node.style;
    if (inlineStyle && (inlineStyle instanceof CSSStyleDeclaration)) {
      var inlineStyleColletion = {};
      for (var j = 0, c = inlineStyle.length; j < c; ++j) {
        var name = inlineStyle[j];
        inlineStyleColletion[name] = inlineStyle.getPropertyValue(name);
      }
      macthedCSSStyles.push(inlineStyleColletion);
    }
    return macthedCSSStyles;
  },

  /**
   * Returns specified style property information that is defined on specified
   * node (including inline style) by name.
   * @param {object} node node to get prototypes for.
   * @param {boolean} authorOnly Determines whether only author styles need to
   *     be added.
   * @return {object} value of specified style property information. Return
   *     undefined if the specified property is not defined on the node.
   */
  getDefinedStylePropertyByName : function(node, authorOnly, propertyName) {
    var value;
    if (node) {
      if (node.style) {
        value = node.style.getPropertyValue(propertyName);
        if (node.style.getPropertyPriority(propertyName))
          return value;
      }
      var styleRules = node.ownerDocument.defaultView.getMatchedCSSRules(
          node, '', authorOnly);
      if (styleRules) {
        for (var i = styleRules.length - 1; i >= 0; i--) {
          var style = styleRules[i].style;
          if (style.getPropertyPriority(propertyName))
            return style.getPropertyValue(propertyName);
          if (!value)
            value = style.getPropertyValue(propertyName);
        }
      }
    }
    return value;
  },

  getDefinedStylePropertyByName2 : function(node, authorOnly, propertyName) {
    if (node) {
      var macthedCSSStyles =
          chrome_comp.getNodeDefinedStyles(node, authorOnly);
      for (var i = 0, c = macthedCSSStyles.length; i < c; ++i) {
        var styelsPerRule = macthedCSSStyles[i];
        if (propertyName in styelsPerRule)
          return styelsPerRule[propertyName];
      }
    }
  },

  isReplacedElement: function(element) {
    if (element) {
      var tagName = element.tagName;
      return tagName == 'IMG' || tagName == 'OBJECT' || tagName == 'EMBED' ||
             tagName == 'BUTTON' || tagName == 'TEXTAREA' ||
             tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'IFRAME';
    }
  },

  getNextNodeInDocument : function(node) {
    while (node) {
      if (node.nextSibling)
        return node.nextSibling;
      node = node.parentNode;
    }
  },

  hasLayoutInIE: function(element) {
    if (!(element && element.nodeType == Node.ELEMENT_NODE))
      return false;
    var tagName = element.tagName;
    if (tagName == 'TD' || tagName == 'TH' ||
        tagName == 'IMG' || tagName == 'HR' ||
        tagName == 'INPUT' || tagName == 'BUTTON' ||
        tagName == 'FILE' || tagName == 'SELECT' ||
        tagName == 'TEXTAREA' || tagName == 'FIELDSET')
      return true;
    var style = chrome_comp.getComputedStyle(element);
    if (style.float != 'none' ||
        style.position == 'absolute' ||
        style.display == 'inline-block' ||
        parseInt(chrome_comp.getDefinedStylePropertyByName(
            element, false, 'width')) > 0 ||
        parseInt(chrome_comp.getDefinedStylePropertyByName(
            element, false, 'height')) > 0 ||
        style.zoom != '1')
      return true;
    var definedZoom = chrome_comp.getDefinedStylePropertyByName(element, false,
          'zoom');
    return definedZoom && definedZoom != 'normal';
  },

  /**
   * Determines if a node affects normal flow.
   * @param {Node} node the DOM node to test
   * @param {boolean=} opt_ignoreFixedPosition if 'position: fixed' is ignored
   *     (because some browsers don't support it). Default is not to ignore.
   * @return 0 if doesn't affect; 1 if affects; -1 if not determined (e.g. a
   *     span which we don't want to traverse the children)
   */
  mayAffectNormalFlow: function(node, opt_ignoreFixedPosition) {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return node.textContent ? 1 : 0;
      case Node.ELEMENT_NODE:
        var style = chrome_comp.getComputedStyle(node);
        var position = style.position;
        if (position == 'absolute' ||
            (!opt_ignoreFixedPosition && position == 'fixed'))
          return 0;

        if (style.float != 'none')
          return 0;

        var display = style.display;
        switch (display) {
          case 'none':
            return 0;
          case 'inline':
            return chrome_comp.isReplacedElement(node) ? 1 : -1;
          default:
            return 1;
        }
      case Node.COMMENT_NODE:
        return 0;
      default:
        return 1;
    }
  },

  inQuirksMode: function() {
    return document.compatMode != 'CSS1Compat';
  }

  };  // return
})();

chrome_comp.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h;
};

chrome_comp.Rect.prototype = {
  createFromString : function(rectString) {
    // The input rectSring supposed to be array to contain 'x, y, width, height'
    var valueArray = eval(rectString);
    if (valueArray instanceof Array) {
      this.left = valueArray[0];
      this.top = valueArray[1];
      this.width = valueArray[2];
      this.height = valueArray[3];
      return true;
    }
    return false;
  },

  clone : function() {
    return new chrome_comp.Rect(this.left, this.top,
                                this.width, this.height);
  },

  copy : function(rect) {
    this.left = rect.left;
    this.top = rect.top;
    this.width = rect.width;
    this.height = rect.height;
  },

  intersection : function(rect) {
    var x0 = Math.max(this.left, rect.left);
    var x1 = Math.min(this.left + this.width, rect.left + rect.width);
    if (x0 <= x1) {
      var y0 = Math.max(this.top, rect.top);
      var y1 = Math.min(this.top + this.height, rect.top + rect.height);
      if (y0 <= y1) {
        this.left = x0;
        this.top = y0;
        this.width = x1 - x0;
        this.height = y1 - y0;
        if (!this.width || !this.height)
          return false;
        return true;
      }
    }
    return false;
  },

  unionRect : function(rect) {
    var right = Math.max(this.left + this.width, rect.left + rect.width);
    var bottom = Math.max(this.top + this.height, rect.top + rect.height);
    this.left = Math.min(this.left, rect.left);
    this.top = Math.min(this.top, rect.top);
    this.width = right - this.left;
    this.height = bottom - this.top;
  },

  toString : function() {
    return '(' + this.left + ', ' + this.top + ' - ' + this.width + 'w x ' +
           this.height + 'h)';
  },

  containsInVertical : function(another) {
    return this.top <= another.top &&
           this.top + this.height >= another.top + another.height;
  },

  containsInHorizontal : function(another) {
    return this.left <= another.left &&
           this.left + this.width >= another.left + another.width;
  },

  contains : function(another) {
    return this.containsInHorizontal(another) && containsInVertical(another);
  },

  isEmpty : function() {
    return (this.width <= 0 || this.height <= 0);
  }
};


chrome_comp.PageUtil = (function() {
  // Private data member.

  // Private function is to get the rectangle bands of the specified text node.
  return {
    // Gets ele's left coordinate related to current page
    pageLeft : function(ele) {
      return ele.offsetParent ?
        ele.offsetLeft + chrome_comp.PageUtil.pageLeft(ele.offsetParent) :
        ele.offsetLeft;
    },

    // Gets ele's top coordinate related to current page
    pageTop : function(ele) {
      return ele.offsetParent ?
          ele.offsetTop + chrome_comp.PageUtil.pageTop(ele.offsetParent) :
          ele.offsetTop;
    },

    // Gets ele's left coordinate related to its parent node
    parentLeft : function(ele) {
      var parentNode = ele.parentNode;
      return parentNode == ele.offsetParent ?
          ele.offsetLeft :
          chrome_comp.PageUtil.pageLeft(ele) -
              chrome_comp.PageUtil.pageLeft(parentNode);
    },

    // Gets ele's top coordinate related to its parent node
    parentTop : function(ele) {
      var parentNode = ele.parentNode;
      return parentNode == ele.offsetParent ?
          ele.offsetTop : chrome_comp.PageUtil.pageTop(ele) -
                          chrome_comp.PageUtil.pageTop(parentNode);
    },

    getNodeRects : function(node) {
      if (!node)
        return [];
      var clientRects;
      var useAncestor;
      while (node) {
        if (Node.TEXT_NODE == node.nodeType) {
          var range = document.createRange();
          range.setStartBefore(node);
          range.setEndAfter(node);
          clientRects = range.getClientRects();
        } else if (node.getClientRects) {
          clientRects = node.getClientRects();
        }
        if (clientRects && clientRects.length)
          break;
        // For a node that has no location, returns rectangle of its
        // nearest parent.
        node = node.parentNode;
        useAncestor = true;
      }
      if (!node)
        return [];

      var useWidth = 0;
      var useHeight = 0;
      var style = chrome_comp.getComputedStyle(node);
      if (style && style.overflow == 'visible') {
        useWidth = node.scrollWidth;
        useHeight = node.scrollHeight;
      }
      var rects = [];
      for (var i = 0, c = clientRects.length; i < c; i++) {
        var clientRect = clientRects[i];
        rects.push({
          left: clientRect.left + window.pageXOffset,
          top: clientRect.top + window.pageYOffset,
          width: c == 1 && useWidth ? useWidth : clientRect.width,
          height: c == 1 && useHeight ? useHeight : clientRect.height
        });
      }
      if (useAncestor)
        rects.fromAncestor = true;
      return rects;
    }
  };
})();

// param: @object, object, point to the object which has API we want to hook
// param: @existingMethodName, string, point to the name of API which we want to
//    hook
chrome_comp.ExistingMethodHookObject = function(object, existingMethodName) {
  if (typeof object[existingMethodName] != 'function')
    throw new Error('the target property is not a function');

  this.hookedObject_ = object;
  this.existingMethodName_ = existingMethodName;
  this.hookHandlersForExistingMethod_ = [];
  this.saveExistingMethodHandler_ = null;
  this.enabled_ = false;

  var This = this;
  // this is orginal this context for orginal function call
  this.newMethodHandler_ = function() {
    if (!This.enabled_ || chrome_comp.areHooksDisabled())
      return This.saveExistingMethodHandler_.apply(this, arguments);

    var result, error = null;
    var callStack = arguments.callee;
    try {
      result = This.saveExistingMethodHandler_.apply(this, arguments);
    } catch (e) {
      error = e;
    }
    // copy the hookHandlers to a cache in case someone call unregister inside
    // the hookHandler.
    var cacheHandlers = This.hookHandlersForExistingMethod_.concat();
    for (var i = 0, c = cacheHandlers.length; i < c; ++i) {
      try {
        cacheHandlers[i].call(this, result, arguments, callStack);
      } catch (e) {
        chrome_comp.printError('Error in existing method handler: ', e);
      }
    }
    if (error)
      throw error;
    return result;
  };
};

chrome_comp.ExistingMethodHookObject.prototype.initialize = function() {
  if (this.saveExistingMethodHandler_)
    return false; // Already initialized.
  var originalMethod = this.hookedObject_[this.existingMethodName_];
  if (typeof originalMethod != 'function')
    return false;
  this.saveExistingMethodHandler_ = originalMethod;
  this.hookedObject_[this.existingMethodName_] = this.newMethodHandler_;
  this.enabled_ = true;
  return true;
};

chrome_comp.ExistingMethodHookObject.prototype.uninitialize = function() {
  if (this.saveExistingMethodHandler_) {
    if (this.hookedObject_[this.existingMethodName_] ==
        this.newMethodHandler_) {
      // Reset the original method only if we are still the first handler.
      this.hookedObject_[this.existingMethodName_] =
          this.saveExistingMethodHandler_;
    }
  }
  this.enabled_ = false;
};

/**
 * Registers a hook to the existing method.
 * @param {function(this:originalThis, Object, Arguments)} hook the hook to
 *     register. The hook will be called when the original method is called,
 *     in the context of the original this, with the first parameter the result
 *     of the original method, and the second parameter the original arguments.
 */
chrome_comp.ExistingMethodHookObject.prototype.registerHookHandler = function(
    hook) {
  for (var i = 0, c = this.hookHandlersForExistingMethod_.length; i < c; ++i) {
    if (hook == this.hookHandlersForExistingMethod_[i]) {
      return false;
    }
  }
  this.hookHandlersForExistingMethod_.push(hook);
  chrome_comp.trace('Register existing method hook: ' +
      this.existingMethodName_);
  return true;
};

chrome_comp.ExistingMethodHookObject.prototype.unregisterHookHandler = function(
    hook) {
  for (var i = 0, c = this.hookHandlersForExistingMethod_.length; i < c; ++i) {
    if (hook == this.hookHandlersForExistingMethod_[i]) {
      chrome_comp.trace('Unregister existing method hook: ' +
          this.existingMethodName_);
      this.hookHandlersForExistingMethod_.splice(i, 1);
      return true;
    }
  }
  return false;
};

// ObjectWrapDelegate class will create a empty object(wrapper), map its
// prototype to the 'originalObject', then search all non-function properties
// (except those properties which match the propertyNameFilter) of the
// 'orginalObject' and set corresponding getter/setter to the wrapper.
// Then you can manipulate the wrapper as 'originalObject' because the wrapper
// use the corresponding getter/setter to access the corresponding properties in
// 'originalObject' and the all function calls can be call through the prototype
// inherit.
// After creating the wrapper object, you can use watch method to monitor any
// property which you want to know when it has been read(get) or change(set).
// Please see the detail comment on method watch.
// Remember the ObjectWrapDelegate returns the wrapDelegateObject instead of
// really wrapper object. You have to use ObjectWrapDelegate.getWrapper to get
// real wrapper object.
// parameter @originalObject, object which you want to wrap
chrome_comp.ObjectWrapDelegate = function(originalObject) {
  // The wrapper is the object we use to wrap the 'originalObject'.
  this.wrapper_ = chrome_comp.clone(originalObject);
  // This object to save all watch handlers.
  this.watcherTable_ = {};

  // For closure to access the private data of class.
  var This = this;
  // Set the getter object.
  this.setGetterAndSetter_ = function(propertyName) {
    this.wrapper_.__defineGetter__(propertyName, function() {
      var internalObj = this.chrome_comp_getInternalObject();
      var returnValue = internalObj[propertyName];
      if (!chrome_comp.areHooksDisabled()) {
        // See whether this property has been watched.
        var watchers = This.watcherTable_[propertyName];
        if (watchers) {
          // copy the watcher to a cache in case someone call unwatch inside the
          // watchHandler.
          var watchersCache = watchers.concat();
          for (var i = 0, c = watchersCache.length; i < c; ++i) {
            var watcher = watchersCache[i];
            try {
              returnValue = watcher.call(this, returnValue, returnValue, 'get');
            } catch (e) {
              chrome_comp.printError(
                  'Error in existing property getter handler: ', e);
            }
          }
        }
      }
      return returnValue;
    });
    // Set the setter object.
    this.wrapper_.__defineSetter__(propertyName, function(newValue) {
      var internalObj = this.chrome_comp_getInternalObject();
      if (!chrome_comp.areHooksDisabled()) {
        var oldValue = undefined;
        try {
          oldValue = internalObj[propertyName];
        } catch (e) {
        }
        // See whether this property has been watched.
        var watchers = This.watcherTable_[propertyName];
        if (watchers) {
          // copy the watcher to a cache in case someone call unwatch inside the
          // watchHandler.
          var watchersCache = watchers.concat();
          for (var i = 0, c = watchersCache.length; i < c; ++i) {
            var watcher = watchersCache[i];
            try {
              newValue = watcher.call(this, oldValue, newValue, 'set');
            } catch (e) {
              chrome_comp.printError(
                  'Error in existing property setter handler: ', e);
            }
          }
        }
      }
      internalObj[propertyName] = newValue;
    });
  };
};

chrome_comp.ObjectWrapDelegate.prototype.getWrapper = function() {
  return this.wrapper_;
};

// Watches for a property to be accessed or be assigned a value and runs a
// function when that occurs.
// Watches for accessing a property or assignment to a property named prop in
// this object, calling handler(oldval, newval, reason) whenever prop is
// get/set and storing the return value in that property.
// A watchpoint can filter (or nullify) the value assignment, by returning a
// modified newval (or by returning oldval).
// When watchpoint is trigering by get opeartor, the oldval is equal with
// newval. The reason will be 'get'.
// When watchpoint is trigering by set opeartor, The reason will be 'set'.
// If you delete a property for which a watchpoint has been set,
// that watchpoint does not disappear. If you later recreate the property,
// the watchpoint is still in effect.
// To remove a watchpoint, use the unwatch method.
// If register the watchpoint successfully, return true. Otherwise return false.
chrome_comp.ObjectWrapDelegate.prototype.watch = function(
    propertyName, watchHandler) {
  var watchers = this.watcherTable_[propertyName];
  if (watchers) {
    for (var i = 0, c = watchers.length; i < c; ++i) {
      if (watchHandler == watchers[i])
        return false;
    }
  } else {
    watchers = [];
    this.watcherTable_[propertyName] = watchers;
    this.setGetterAndSetter_(propertyName);
  }
  watchers.push(watchHandler);
  chrome_comp.trace('Set property watch handler for: ' + propertyName);
  return true;
};

// Removes a watchpoint set with the watch method.
chrome_comp.ObjectWrapDelegate.prototype.unwatch = function(
    propertyName, watchHandler) {
  var watchers = this.watcherTable_[propertyName];
  if (watchers) {
    for (var i = 0, c = watchers.length; i < c; ++i) {
      if (watchHandler == watchers[i]) {
        watchers.splice(i, 1);
        chrome_comp.trace('Clear property watch handler for: ' + propertyName);
        if (watchers.length == 0) {
          delete this.wrapper_[propertyName];
          delete this.watcherTable_[propertyName];
        }
        return true;
      }
    }
  }
  return false;
};

chrome_comp.SimplePropertyHookObject = function(targetObject, propertyName,
    opt_getterOnly) {
  this.targetObject_ = targetObject;
  this.propertyName_ = propertyName;
  this.getterOnly_ = opt_getterOnly;
  this.shadowPropertyName_ = 'chrome_comp_hooked_property_' + propertyName;
  targetObject[this.shadowPropertyName_] = targetObject[propertyName];
  this.hookHandlersForSimpleProperty_ = [];

  var This = this;
  this.fakePropertyGetter_ = function() {
    var returnValue = this[This.shadowPropertyName_];
    var handlersCache = This.hookHandlersForSimpleProperty_.concat();
    for (var i = 0, c = handlersCache.length; i < c; ++i) {
      var handler = handlersCache[i];
      if (handler.permanent || !chrome_comp.areHooksDisabled()) {
        try {
          returnValue = handler.call(this, returnValue, returnValue, 'get');
        } catch (e) {
          chrome_comp.printError(
              'Error in simple property getter handler: ', e);
        }
      }
    }
    this[This.shadowPropertyName_] = returnValue;
    return returnValue;
  };

  if (!opt_getterOnly) {
    this.fakePropertySetter_ = function(newValue) {
      var oldValue = undefined;
      try {
        oldValue = this[This.shadowPropertyName_];
      } catch (e) {
      }
      var handlersCache = This.hookHandlersForSimpleProperty_.concat();
      for (var i = 0, c = handlersCache.length; i < c; ++i) {
        var handler = handlersCache[i];
        if (handler.permanent || !chrome_comp.areHooksDisabled()) {
          try {
            newValue = handler.call(this, oldValue, newValue, 'set');
          } catch (e) {
            chrome_comp.printError(
                'Error in simple property setter handler: ', e);
          }
        }
      }
      this[This.shadowPropertyName_] = newValue;
    };
  }
};

chrome_comp.SimplePropertyHookObject.prototype.initialize = function() {
  this.targetObject_.__defineGetter__(this.propertyName_,
      this.fakePropertyGetter_);
  if (!this.getterOnly_) {
    this.targetObject_.__defineSetter__(this.propertyName_,
        this.fakePropertySetter_);
  }
  return true;
};

chrome_comp.SimplePropertyHookObject.prototype.uninitialize = function() {
  // No good way to remove getter/setter.
};

chrome_comp.SimplePropertyHookObject.prototype.registerHookHandler = function(
    hook, opt_permanent) {
  for (var i = 0, c = this.hookHandlersForSimpleProperty_.length; i < c; ++i) {
    if (hook == this.hookHandlersForSimpleProperty_[i])
      return false;
  }
  hook.permanent = opt_permanent;
  this.hookHandlersForSimpleProperty_.push(hook);
  chrome_comp.trace('Register simple property hook: ' + this.propertyName_);
  return true;
};

chrome_comp.SimplePropertyHookObject.prototype.unregisterHookHandler =
    function(hook) {
  for (var i = 0, c = this.hookHandlersForSimpleProperty_.length; i < c; ++i) {
    if (hook == this.hookHandlersForSimpleProperty_[i]) {
      if (hook.permanent) {
        chrome_comp.trace('Permanent hook can\'t be unregistered');
        return false;
      }
      chrome_comp.trace('Unregister simple property hook: ' +
          this.propertyName_);
      this.hookHandlersForSimpleProperty_.splice(i, 1);
      return true;
    }
  }
  return false;
};

//******************** The compatibility detector framework *******************
chrome_comp.CompDetect = (function() {
  // Array which contains all type detectors
  var detectors_ = [];

  // All problems reported so far.
  // key: type id
  // value: serialized report data, which includes all the occurrences of the
  //     type of problem
  var problems_ = { };
  var actualJSProblems_ = { };
  var expectedJSProblems_ = { };
  var mismatchedProblems_ = [];

  // Control re-entrance of addProblem().
  var inAddProblem_ = false;

  var blockStack_ = [];
  var hasLayoutStack_ = [];
  var currentScanDomDetector_ = null;
  var displayNoneEndNode_ = null;

  function getCurrentStackFrame(stack, opt_offset) {
    opt_offset = opt_offset || 0;
    var depth = stack.length;
    return depth > opt_offset ? stack[depth - opt_offset - 1] : null;
  }

  function putValueInStack(stack, name, value, opt_offset) {
    if (!currentScanDomDetector_)
      return false;
    var frame = getCurrentStackFrame(stack, opt_offset);
    if (!frame)
      return false;
    if (!frame.values)
      frame.values = { };
    if (!frame.values[currentScanDomDetector_])
      frame.values[currentScanDomDetector_] = { };
    frame.values[currentScanDomDetector_][name] = value;
    return true;
  }

  function getValueInStack(stack, name, opt_offset) {
    if (!currentScanDomDetector_)
      return undefined;
    var frame = getCurrentStackFrame(stack, opt_offset);
    if (!frame || !frame.values || !frame.values[currentScanDomDetector_])
      return undefined;
    return frame.values[currentScanDomDetector_][name];
  }

  function deleteValueInStack(stack, name, opt_offset) {
    if (!currentScanDomDetector_)
      return false;
    var frame = getCurrentStackFrame(stack, opt_offset);
    return frame && frame.values && frame.values[currentScanDomDetector_] &&
           delete frame.values[currentScanDomDetector_][name];
  }

  function clearValuesInStack(stack, opt_offset) {
    if (currentScanDomDetector_) {
      var frame = getCurrentStackFrame(stack, opt_offset);
      if (frame && frame.values)
        delete frame.values[currentScanDomDetector_];
    }
  }

  function addPopHandlerInStack(stack, handler, opt_offset) {
    var frame = getCurrentStackFrame(stack, opt_offset);
    if (!frame)
      return;
    if (!frame.popHandlers)
      frame.popHandlers = [];
    frame.popHandlers.push(handler);
  }

  function popStack(stack) {
    var frame = getCurrentStackFrame(stack);
    if (!frame)
      return;
    if (frame.popHandlers) {
      for (var i = 0, c = frame.popHandlers.length; i < c; i++)
        frame.popHandlers[i]();
    }
    stack.pop();
  }

  var scanDomContext_ = {
    getParentBlock : function(opt_offset) {
      var frame = getCurrentStackFrame(blockStack_, opt_offset);
      return frame ? frame.element : null;
    },
    getCurrentHasLayoutInIE : function(opt_offset) {
      var frame = getCurrentStackFrame(hasLayoutStack_, opt_offset);
      return frame ? frame.element : null;
    },
    putValueInBlockStack : function(name, value, opt_offset) {
      return putValueInStack(blockStack_, name, value, opt_offset);
    },
    getValueInBlockStack : function(name, opt_offset) {
      return getValueInStack(blockStack_, name, opt_offset);
    },
    deleteValueInBlockStack : function(name, opt_offset) {
      return deleteValueInStack(blockStack_, name, opt_offset);
    },
    clearValuesInBlockStack : function(opt_offset) {
      clearValuesInStack(blockStack_, opt_offset);
    },
    addPopHandlerInBlockStack : function(handler, opt_offset) {
      addPopHandlerInStack(blockStack_, handler, opt_offset);
    },
    putValueInHasLayoutInIEStack : function(name, value, opt_offset) {
      return putValueInStack(hasLayoutStack_, name, value, opt_offset);
    },
    getValueInHasLayoutInIEStack : function(name, opt_offset) {
      return getValueInStack(hasLayoutStack_, name, opt_offset);
    },
    deleteValueInHasLayoutInIEStack : function(name, opt_offset) {
      return deleteValueInStack(hasLayoutStack_, name, opt_offset);
    },
    clearValuesInHasLayoutInIEStack : function(opt_offset) {
      clearValuesInStack(hasLayoutStack_, opt_offset);
    },
    addPopHandlerInHasLayoutInIEStack : function(handler, opt_offset) {
      addPopHandlerInStack(hasLayoutStack_, handler, opt_offset);
    },
    isDisplayNone : function() {
      return displayNoneEndNode_ ? true : false;
    }
  };

  // Processes each element node under the rootNode
  // Param @node, object, current used node
  // Param @compDetectorArray, array, array which contains all available
  //    detectors for current used page.
  function processTree(rootNode, compDetectorArray) {
    var nodeIterator = document.createNodeIterator(
        rootNode, NodeFilter.SHOW_ALL, null, false);
    var currentNode;
    // First cache all nodes into the nodes array to prevent DOM tree change
    // during detection from breaking NodeIterator.
    var nodes = [];
    while (currentNode = nodeIterator.nextNode())
      nodes.push(currentNode);

    for (var i = 0, c = nodes.length; i < c; i++)
      processNode(nodes[i], compDetectorArray);

    blockStack_ = [];
    hasLayoutStack_ = [];
    currentScanDomDetector_ = null;
    displayNoneEndNode = null;
  }

  function processNode(currentNode, compDetectorArray) {
    var depth = blockStack_.length;
    if (depth && currentNode == blockStack_[depth - 1].endNode)
      popStack(blockStack_);
    depth = hasLayoutStack_.length;
    if (depth && currentNode == hasLayoutStack_[depth - 1].endNode)
      popStack(hasLayoutStack_);
    if (displayNoneEndNode_ && currentNode == displayNoneEndNode_)
      displayNoneEndNode_ = null;

    // Check all detectors for this node.
    for (var i = 0, c = compDetectorArray.length; i < c; ++i) {
      var detector = compDetectorArray[i];
      try {
        if (detector.canCheckNow()) {
          currentScanDomDetector_ = detector.constructor.detectorName;
          detector.checkNode(currentNode, scanDomContext_);
        }
      } catch (e) {
        chrome_comp.printError('Error running detector ' +
            detector.constructor.detectorName + ': ', e);
      }
    }

    var endNode;
    if (Node.ELEMENT_NODE == currentNode.nodeType) {
      if (chrome_comp.startsBlockBox(currentNode)) {
        endNode = chrome_comp.getNextNodeInDocument(currentNode);
        blockStack_.push({ element: currentNode, endNode: endNode });
      }
      if (chrome_comp.hasLayoutInIE(currentNode)) {
        endNode = endNode || chrome_comp.getNextNodeInDocument(currentNode);
        hasLayoutStack_.push({ element: currentNode, endNode: endNode });
      }
      if (chrome_comp.getComputedStyle(currentNode).display == 'none' &&
          !displayNoneEndNode_) {
        displayNoneEndNode_ = endNode ||
            chrome_comp.getNextNodeInDocument(currentNode);
      }
    }
  }

  function checkDetectionResultForNode(node, expectedProblems, index) {
    var actualProblems = node.chrome_comp_actualProblems;
    if (!actualProblems && !expectedProblems)
      return;
    expectedProblems = expectedProblems ?
         expectedProblems.split(' ').sort().join(' ') : '';
    actualProblems = actualProblems ? actualProblems.sort().join(' ') : '';
    if (expectedProblems != actualProblems) {
      mismatchedProblems_.push({
        node: node,
        expected: expectedProblems,
        actual: actualProblems,
        index: index
      });
      console.log('*** Actual problem not same as expected:');
      console.log(node);
      if (index != undefined) {
        console.log('No. ' + index + ' child of parent: ');
        console.log(node.parentNode);
      }
      console.log('Expected: ' + expectedProblems);
      console.log('Actual: ' + actualProblems);
    }
  }

  function checkDetectionResultForJS(sourceAndLine) {
    expectedProblems = expectedJSProblems_[sourceAndLine];
    expectedProblems = expectedProblems ?
         expectedProblems.split(' ').sort().join(' ') : '';
    actualProblems = actualJSProblems_[sourceAndLine];
    actualProblems = actualProblems ? actualProblems.sort().join(' ') : '';
    if (expectedProblems != actualProblems) {
      mismatchedProblems_.push({
        sourceAndLine: sourceAndLine,
        expected: expectedProblems,
        actual: actualProblems
      });
      console.log('*** Actual problem not same as expected:');
      console.log(sourceAndLine);
      console.log('Expected: ' + expectedProblems);
      console.log('Actual: ' + actualProblems);
    }
  }

  function checkDetectionResults(rootNode) {
    var nodeIterator = document.createNodeIterator(
        rootNode, NodeFilter.SHOW_ELEMENT, null, false);
    var element;
    while (element = nodeIterator.nextNode()) {
      checkDetectionResultForNode(element,
          element.getAttribute('expectedproblems'));
      var childNodes = element.childNodes;
      const CHILD_PREFIX = 'expectedproblemschild';
      for (var i = 0, c = element.attributes.length; i < c; i++) {
        var attr = element.attributes[i];
        var name = attr.name;
        if (name.substring(0, CHILD_PREFIX.length) == CHILD_PREFIX) {
          var index = parseInt(name.substring(CHILD_PREFIX.length));
          if (index < 0 || index >= childNodes.length ||
              Node.ELEMENT_NODE == childNodes[index].nodeType) {
            console.log('*** Bad child expected problems: ' + name);
            console.log(element);
            mismatchedProblems_.push({
              node: element,
              badExpectedProblemsChild: name + '=' + attr.value
            });
          }
        }
      }
      for (var i = 0, c = childNodes.length; i < c; i++) {
        var child = childNodes[i];
        if (Node.ELEMENT_NODE != child.nodeType) {
          checkDetectionResultForNode(child,
              element.getAttribute(CHILD_PREFIX + i), i);
        }
      }
    }

    for (var i in actualJSProblems_)
      checkDetectionResultForJS(i);

    if (mismatchedProblems_.length) {
      console.log('*** ' + mismatchedProblems_.length + ' test(s) failed:');
      console.log(mismatchedProblems_);
    }
  }

  // Run all scan-dom type detectors for current page.
  function detectPageWithScanDomTypeDetectors(externalDetectors) {
    // Disable all hooks during DOM scanning.
    chrome_comp.enableHooks(false);
    try {
      var detectors = externalDetectors || detectors_;
      var scanDomDetectors = [];
      for (var i = 0, c = detectors.length; i < c; i++) {
        if (detectors[i] instanceof chrome_comp.CompDetect.ScanDomBaseDetector)
          scanDomDetectors.push(detectors[i]);
      }
      processTree(document.documentElement, scanDomDetectors);
    } finally {
      chrome_comp.enableHooks(true);
    }
  }

  return {
    getAllProblems : function() {
      return problems_;
    },

    registerExistingMethodHook: function(object, method, handler) {
      if (!object || !method || !handler)
        return;
      if (!object.hasOwnProperty('chrome_comp_methodHooks'))
        object.chrome_comp_methodHooks = { };
      var hookObject = object.chrome_comp_methodHooks[method];
      if (!hookObject) {
        hookObject = new chrome_comp.ExistingMethodHookObject(object, method);
        if (!hookObject.initialize())
          return;
        object.chrome_comp_methodHooks[method] = hookObject;
      }
      return hookObject.registerHookHandler(handler);
    },

    unregisterExistingMethodHook: function(object, method, handler) {
      if (!object || !method || !handler ||
          !object.hasOwnProperty('chrome_comp_methodHooks'))
        return false;
      var hookObject = object.chrome_comp_methodHooks[method];
      if (hookObject && hookObject.unregisterHookHandler(handler)) {
        if (hookObject.hookHandlersForExistingMethod_.length == 0) {
          hookObject.uninitialize();
          delete object.chrome_comp_methodHooks[method];
        }
        return true;
      }
      return false;
    },

    registerExistingPropertyHook: function(
        ownerObject, ownerProperty, property, handler) {
      if (!ownerObject || !ownerProperty || !property || !handler)
        return false;
      var object = ownerObject[ownerProperty];
      if (!object || typeof object != 'object')
        return false;
      if (!ownerObject.hasOwnProperty('chrome_comp_wrapDelegates'))
        ownerObject.chrome_comp_wrapDelegates = { };
      var wrapDelegate = ownerObject.chrome_comp_wrapDelegates[ownerProperty];
      if (!wrapDelegate) {
        wrapDelegate = new chrome_comp.ObjectWrapDelegate(object);
        ownerObject.chrome_comp_wrapDelegates[ownerProperty] = wrapDelegate;
        ownerObject.__defineGetter__(ownerProperty, function() {
          return wrapDelegate.getWrapper();
        });
      }
      return wrapDelegate.watch(property, handler);
    },

    unregisterExistingPropertyHook: function(
        ownerObject, ownerProperty, property, handler) {
      if (!ownerObject || !ownerProperty || !property || !handler ||
          !ownerObject.hasOwnProperty('chrome_comp_wrapDelegates'))
        return false;
      var wrapDelegate =
          ownerObject.chrome_comp_wrapDelegates[ownerProperty];
      return wrapDelegate && wrapDelegate.unwatch(property, handler);
    },

    /**
     * Registers a simple property hook.
     * The opt_getterOnly parameter are only applicable when the property is
     * first hooked. Later hooks to the same property can't change it.
     * @param {Object} object the object whose property to be hooked.
     * @param {String} property the name of the property to hook.
     * @param {function(Object, Object, String): Object} the hook handler which
     *     will be called when the property is got or set.
     * @param {boolean=} opt_getterOnly controls if hooks only getter.
     * @param {boolean=} opt_permanent if true this handler is never disabled
     *     even when chrome_comp.enableHooks(false) is called.
     * @return {boolean} whether the registration succeeded.
     */
    registerSimplePropertyHook: function(object, property, handler,
        opt_getterOnly, opt_permanent) {
      if (!object || !property || !handler)
        return;
      if (!object.hasOwnProperty('chrome_comp_propertyHooks'))
        object.chrome_comp_propertyHooks = { };
      var hookObject = object.chrome_comp_propertyHooks[property];
      if (!hookObject) {
        hookObject = new chrome_comp.SimplePropertyHookObject(object,
            property, opt_getterOnly);
        if (!hookObject.initialize())
          return;
        object.chrome_comp_propertyHooks[property] = hookObject;
      }
      return hookObject.registerHookHandler(handler, opt_permanent);
    },

    unregisterSimplePropertyHook: function(object, property, handler) {
      if (!object || !property || !handler ||
          !object.hasOwnProperty('chrome_comp_propertyHooks'))
        return false;
      var hookObject = object.chrome_comp_propertyHooks[property];
      if (hookObject && hookObject.unregisterHookHandler(handler)) {
        if (hookObject.hookHandlersForSimpleProperty_.length == 0) {
          hookObject.uninitialize();
          delete object.chrome_comp_propertyHooks[property];
        }
        return true;
      }
      return false;
    },

    /**
     * Registers a detector.
     * @param {function(Node)} detectorConstructor constructor of the detector.
     * @return the detector instance if created successfully.
     */
    registerDetector: function(detectorConstructor) {
      if (!(detectorConstructor && detectorConstructor.detectorName))
        return;
      var name = detectorConstructor.detectorName;
      if ((chrome_comp.CompDetectorConfig.enabledDetectors &&
           !chrome_comp.CompDetectorConfig.enabledDetectors[name]) ||
          chrome_comp.CompDetectorConfig.disabledDetectors[name])
        return;
      var instance = new detectorConstructor(document.documentElement);

      // ScanDomBaseDetector now inherits from NonScanDomDetector, so all
      // detectors should be instances of NonScanDomDetector.
      if (instance instanceof chrome_comp.CompDetect.NonScanDomBaseDetector) {
        detectors_.push(instance);
        instance.setUp();
        return instance;
      }
      chrome_comp.trace('Invalid detector: ' + name);
    },

    declareDetectorClass: function(name, superClass, constructor
        /*,... methods */) {
      if (chrome_comp.CompDetectorConfig.disabledDetectors[name])
        return null;
      // Dynamically create a named function as the new constructor.
      // The name is useful for debugging because we'll see meaningful type
      // in the printed stack trace.
      var newConstructor = eval('(function ' + name + '() {' +
           'superClass.apply(this, arguments);' +
           (constructor ? 'constructor.apply(this, arguments);' : '') +
           '})');
      chrome_comp.extend(newConstructor, superClass);
      chrome_comp.CompDetect[name] = newConstructor;
      newConstructor.detectorName = name;
      for (var i = 3, c = arguments.length; i < c; i++)
        newConstructor.prototype[arguments[i].name] = arguments[i];
      return newConstructor;
    },

    /**
     * This method provides a much easier way to declare a new detector.
     */
    declareDetector: function(name, superClass, constructor /*,... methods */) {
      var newConstructor = chrome_comp.CompDetect.declareDetectorClass.apply(
          this, arguments);
      return newConstructor ?
          chrome_comp.CompDetect.registerDetector(newConstructor) : null;
    },

    // Run all scan-dom type detectors for current page.
    runScanDomDetectorsForCurrentPage : function() {
      detectPageWithScanDomTypeDetectors();
    },

    notifyProblemDetected: function(typeId, issue, occurrence) {
      chrome_comp.sendRequest('chrome_comp_problemDetected', {
          chrome_comp_reason: typeId,
          chrome_comp_severity:
              (occurrence.severityLevel || issue.severityLevel) >= 7 ?
                  'error' : 'warning',
          chrome_comp_description: issue.issueDescription,
          chrome_comp_occurrencesNumber: issue.occurrences.length
      });
    },

    // Send the result of the compatibility detection for current page.
    sendDetectionResults: function() {
      var problems = chrome_comp.CompDetect.getAllProblems();
      chrome_comp.sendRequest('chrome_comp_endOfDetection', {
        totalProblems : Object.keys(problems).length
      });
    },

    // Diagnose  compatibility issues on current page
    diagnoseCompatibilityIssues : function() {
      function loadHandlerForCompDetector() {
        var startTime = new Date().getTime();
        chrome_comp.trace('Start compatibility detection...' +
            '\ncurrent URL is: ' + window.location +
            '\noriginal URL is: ' + chrome_comp.getTargetPageURL());
        try {
          chrome_comp.CompDetect.runScanDomDetectorsForCurrentPage();
        } catch (e) {
          chrome_comp.printError('Error running scan dom detectors: ', e);
          if (chrome_comp.CompDetectorConfig.canSendBugReport) {
            var detector = new chrome_comp.CompDetect.InternalExceptionDetector;
            detector.report(e.toString());
          }
        }

        // For now we disable all hooks after the one-shot detection.
        // In the future we might remove this if we want to support real-time
        // detection during UI-interaction.
        chrome_comp.enableHooks(false);

        chrome_comp.trace(detectors_.length + ' detectors');
        for (var i = 0, c = detectors_.length; i < c; ++i)
          detectors_[i].postAnalyze();

        var detectionTime = new Date().getTime() - startTime;
        window.console.log('Finished compatibility detection in ' +
            detectionTime + ' ms');

        chrome_comp.CompDetect.sendDetectionResults();
        if (chrome_comp.CompDetectorConfig.unitTestMode)
          checkDetectionResults(document.documentElement);
      }

      var timer = chrome_comp.CompDetectorConfig.delayRunDetectionTimer;
      // Check whether we need to immediately call load handler of
      // CompDetector.
      if (chrome_comp.CompDetectorConfig.delayRunDetection &&
          typeof timer == 'number') {
        window.setTimeout(loadHandlerForCompDetector, timer);
      } else {
        loadHandlerForCompDetector();
      }
    },

    // See chrome_comp.CompDetect.BaseDetector.prototype.addProblem.
    addProblem : function(typeId, opt_information) {
      if (inAddProblem_)
        return;

      try {
        // Because we have many hooks to various objects, methods and
        // properties, addProblem itself might trigger the hooks and in turn
        // report false problems. For example, getting the stack trace might
        // trigger enumeration of properties of some object which has property
        // hooks.
        inAddProblem_ = true;

        // This keeps backward-compatibility with original interface.
        if (opt_information instanceof Array)
          opt_information = { nodes: opt_information };
        if (!opt_information)
          opt_information = { };

        // Constructs report data
        var data = problems_[typeId];
        if (data) {
          data.repeatedCount++;
          if (data.repeatedCount >=
              chrome_comp.CompDetectorConfig.maxProblemsPerType)
            return;
        } else {
          // Gets more necessary info
          var issue = chrome_comp.w3helpIssues[typeId] ||
                      chrome_comp.nonW3helpIssues[typeId];
          if (!issue) {
            chrome_comp.trace('Missing issue information: ' + typeId);
            return;
          }

          data = {
            issueDescription: issue.description,
            issueUrl: issue.url,
            severityLevel: issue.severityLevel,
            suggestion: issue.suggestion,
            repeatedCount: 1,
            occurrences: []
          };
          problems_[typeId] = data;
        }

        var occurrence = {
          details: opt_information && opt_information.details,
          html: [],
          stack: '',
          nodes: opt_information.nodes || [],
          // If exists and >0, this severity level overrides issue's severity
          // level.
          severityLevel: opt_information.severityLevel,
          rectCallback: opt_information.rectCallback ||
                        chrome_comp.PageUtil.getNodeRects
        };

        var nodes = opt_information.nodes;
        if (nodes) {
          for (var i = 0, len = nodes.length; i < len; ++i) {
            var node = nodes[i];
            // TODO: improve performance by not using outerHTML.
            occurrence.html.push(chrome_comp.ellipsize(
                node.outerHTML || node.textContent, 200));
          }
        }

        var stack = opt_information.stack;
        // Stack will be automatically collected If no stack provided
        if (!stack && (!nodes || opt_information.needsStack))
          stack = chrome_comp.dumpStack();
        if (stack) {
          // Don't add JavaScript problems caused by some extension.
          if (chrome_comp.isCalledFromExtension(stack)) {
            if (!--data.repeatedCount)
              delete problems_[typeId];
            return;
          }
          // Don't add problem occurred at the same place as the last one.
          if (data.occurrences.length > 0 &&
              chrome_comp.getCallSite(
                  data.occurrences[data.occurrences.length - 1].stack) ==
              chrome_comp.getCallSite(stack))
            return;
          occurrence.stack = stack;
        }

        chrome_comp.trace('Add a problem: ' + typeId + ' ' +
            data.issueDescription +
            (data.repeatedCount == 1 ? stack || chrome_comp.dumpStack() :
                 ' count ' + data.repeatedCount));

        if (chrome_comp.CompDetectorConfig.unitTestMode) {
          if (nodes && nodes.length) {
            var node = nodes[0];
            var nodeProblems = node.chrome_comp_actualProblems;
            if (!nodeProblems)
              nodeProblems = [typeId];
            else
              nodeProblems.push(typeId);
            node.chrome_comp_actualProblems = nodeProblems;
          }
          if (stack) {
            var sourceAndLine = chrome_comp.getSourceAndLine(stack);
            var actualProblems = actualJSProblems_[sourceAndLine];
            if (!actualProblems) {
              actualProblems = [];
              actualJSProblems_[sourceAndLine] = actualProblems;
            }
            actualProblems.push(typeId);
          }
        }

        data.occurrences.push(occurrence);
        chrome_comp.CompDetect.notifyProblemDetected(
            typeId, data, occurrence);
        return occurrence;
      } finally {
        inAddProblem_ = false;
      }
    },

    // Used in unit test for JavaScript problems.
    expectProblems : function(x, expected) {
      if (chrome_comp.CompDetectorConfig.unitTestMode) {
        var sourceAndLine = chrome_comp.getSourceAndLine();
        expectedJSProblems_[sourceAndLine] = expected;
        if (!actualJSProblems_[sourceAndLine])
          actualJSProblems_[sourceAndLine] = [];
      }
    },

    cleanUpDetectors : function() {
      for (var i = 0, c = detectors_.length; i < c; ++i)
        detectors_[i].cleanUp();
    }
  };
})();


// ************************** BaseDetector implementation*********************
// @author : jnd@chromium.org
// each detector must implement the following method
// * postAnalyze(), this method will be called before calling hasProblem, it is
//   supposed to do some post analysis in this method.
//
// The following is base detector implementation, it just has base data and
// methods without doing any real detection stuff.
// The developer should write a class, extend the class from this BaseDetector
// implemention and implement the detection logic

chrome_comp.CompDetect.BaseDetector = function(rootNode) {
  this.rootNode_ = rootNode;
  // we need to hook sth in read window object, so we need to get real glocal
  // object.
  this.window_ = window;
  this.document_ = window.document;
  this.hasProblem_ = false;
};

chrome_comp.CompDetect.BaseDetector.detectorName = 'BaseDetector';

chrome_comp.CompDetect.BaseDetector.prototype.postAnalyze = function() {
  // The detector developer must implement his/her own logic for
  // postAnalyze if he/she need this.
};

/**
 * Adds a new detected problem.
 * @param {string} typeId Type ID of the problem.
 * @param {Object=|Array.<Node>} opt_information detailed information about the
 *     problem. It can be an array of problem nodes (which keeps backward
 *     compatibility with original interface), or an object containing the
 *     following optional fields:
 *     - {Array.<Node>} nodes: the related nodes. If there are multiple nodes,
 *       the first one should be the primary node of the problem.
 *     - {string} needsStack: if true or both nodes and stack are omitted,
 *       stack information will be automatically collected.
 *     - {string} stack: the call stack where the problem occurred. A detector
 *       only need to collect stack by itself when addProblem is not called
 *       when the problem occurs.
 *     - {string} details: additional detailed description of the problem.
 *     - {number} severityLevel: if exists and >0, this severity level overrides
 *       the default severity level of the problem.
 *     - {Function(node): Array.<Object>} rectCallback: customized rectangle
 *       callback function which will be called when the annotator needs to
 *       get the position and size of a problem node.
 */
chrome_comp.CompDetect.BaseDetector.prototype.addProblem = function(
    typeId, opt_information) {
  if (!typeId || typeof typeId != 'string')
    return;

  this.hasProblem_ = true;
  chrome_comp.CompDetect.addProblem(typeId, opt_information);
};

// ********************** Detector for internal exception ***************
// This detector will not be registered, and will be used directly to report
// internal exception
chrome_comp.CompDetect.InternalExceptionDetector = function(rootNode) {
  chrome_comp.CompDetect.BaseDetector.call(this, rootNode);
};
chrome_comp.extend(chrome_comp.CompDetect.InternalExceptionDetector,
                   chrome_comp.CompDetect.BaseDetector);

chrome_comp.CompDetect.InternalExceptionDetector.report = function(exception) {
  this.addProblem('##0000', { details: exception });
};


// ********************** NonScanDomBaseDetector implementation***************
// @author : jnd@chromium.org
// each non scan-dom type detector is derived from NonScanDomBaseDetector and
// implement the following method
// * setUp: setup the trap
// * cleanUp: clean up the trap

chrome_comp.CompDetect.NonScanDomBaseDetector = function(rootNode) {
  chrome_comp.CompDetect.NonScanDomBaseDetector.superclass.constructor.call(
      this, rootNode);
};
// You must use chrome_comp.extend to inherit from the BaseDetector
chrome_comp.extend(chrome_comp.CompDetect.NonScanDomBaseDetector,
                   chrome_comp.CompDetect.BaseDetector);

chrome_comp.CompDetect.NonScanDomBaseDetector.prototype.setUp = function() {
  // The detector developer can implement this function which will be called
  // before the page being actually loaded.
};

chrome_comp.CompDetect.NonScanDomBaseDetector.prototype.cleanUp = function() {
  // The detector developer can implement this function which will be called
  // when the detection is finished.
};

// ************************** ScanDomBaseDetector implementation***************
// @author : jnd@chromium.org
// each scan-dom detector is dervided from ScanDomBaseDetector and implement the
// following method
// * checkNode(node, context),  this method is responsible for checking
//    whether the input node has same problem the detector is designed to check.
// * canCheckNow(),  this method is responsible for telling detection tool
//    whether the detector want to check node or not, it will be called before
//    calling checkNode, if the method return false, the checkNode will be skip
//    for this time.
//
// This is base detector implementation, it just has base data and methods
// without doing any real detection stuff.
// The developer should write a class, extend the class from this
// ScanDomBaseDetector implemention and implement the detection logic

chrome_comp.CompDetect.ScanDomBaseDetector = function(rootNode) {
  chrome_comp.CompDetect.ScanDomBaseDetector.superclass.constructor.call(this,
      rootNode);
  // gatherAllProblemNodes_ will control whether we will gather all nodes which
  // have same issues. If gatherAllProblemNodes_ is true, when we will check
  // each node for the specific issue which this detector addresses.
  // If gatherAllProblemNodes_ is false, after we have one node which has the
  // specific issue, we will not call checkNode for this detector.
  // The individual detector can overrite it in its constructor.
  this.gatherAllProblemNodes_ = true;
};
// You must use chrome_comp.extend to inherit from the BaseDetector
chrome_comp.extend(chrome_comp.CompDetect.ScanDomBaseDetector,
                   chrome_comp.CompDetect.NonScanDomBaseDetector);

chrome_comp.CompDetect.ScanDomBaseDetector.prototype.checkNode = function(
    node, context) {
  // The detector developer must implement his/her own logic for checkNode
  // if he/she need this.
};

chrome_comp.CompDetect.ScanDomBaseDetector.prototype.canCheckNow = function() {
  return this.gatherAllProblemNodes_ || !this.hasProblem_;
};

//window.addEventListener('load',
//    chrome_comp.CompDetect.diagnoseCompatibilityIssues, false);
document.documentElement.addEventListener('chrome_comp_checkNode', function() {
  chrome_comp.CompDetect.diagnoseCompatibilityIssues();
}, false);
window.addEventListener('unload',
    chrome_comp.CompDetect.cleanUpDetectors, false);

// To simplify usages.
chrome_comp.expectProblems = chrome_comp.CompDetect.expectProblems;

});
