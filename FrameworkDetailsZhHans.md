# 框架代码说明 #

framework.js 实现了整体检测框架，提供了三种基本检测方式：
  1. `chrome_comp.CompDetect.NonScanDomBaseDetector`
  1. `chrome_comp.CompDetect.ScanDomBaseDetector`
  1. `chrome_comp.CompDetect.registerExistingMethodHook` 和 `chrome_comp.CompDetect.registerExistingPropertyHook`

**`NonScanDomBaseDetector`** 可以自己实现扫描节点机制，用来记录相关节点信息与其他节点比较。例如，检测某些节点是否在渲染时存在布局块重叠情况。

**`ScanDomBaseDetector`** 采用框架提供的扫描节点机制，每扫描一个节点均会调用 **`checkNode`** 方法，检测算法可以再此方法内执行。例如，检测某些节点自身布局情况或自身属性设置等。

无论 **`NonScanDomBaseDetector`** 或者 **`ScanDomBaseDetector`** 类，均有 **postAnalyze** 方法，此方法在所有检测代码执行完成后被统一调用。它可以用来做数据汇总或者检测内容补充修正等后续处理工作；当然，也可以配合 **`NonScanDomBaseDetector`** 机制实现当前检测算法自身的节点扫描分析机制。

**`chrome_comp.CompDetect.registerExistingMethodHook`** 与 **`chrome_comp.CompDetect.registerExistingPropertyHook`** 分别是 JS 脚本的钩子机制。他们分别负责**HOOK已存在的方法**和**HOOK不存在的属性**。当某方法或某属性的钩子被注册后，此方法调用时，会先调用注册的钩子程序，由钩子程序负责调用原始方法以、识别传入的实参、保存方法返回结果等内容，由开发者在钩子注册函数内实现这些内容的解析与分析。

**主要的检测模型图示**
![http://img844.ph.126.net/0pFdck3OPF7nih2c-3tZGA==/1890385943590752722.jpg](http://img844.ph.126.net/0pFdck3OPF7nih2c-3tZGA==/1890385943590752722.jpg)
![http://img616.ph.126.net/8jNaDjM2N2jQlXFiVxU9Zw==/1989465135393179370.jpg](http://img616.ph.126.net/8jNaDjM2N2jQlXFiVxU9Zw==/1989465135393179370.jpg)
![http://img.ph.126.net/CkGzdvRix97hL0Oscc_cyg==/3395151169085260845.jpg](http://img.ph.126.net/CkGzdvRix97hL0Oscc_cyg==/3395151169085260845.jpg)


---


# 脚本注入以及消息传递机制说明 #

由于 Chrome Extensions 机制约束，background.html popup.html option.html 页面均运行在一个独立后端进程。与这些页面通信需要通过IPC异步管道机制，幸好 Chrome 为我们提供了此类API的封装，具体可见扩展开发的通信API部分：
[http://code.google.com/chrome/extensions/extension.html](http://code.google.com/chrome/extensions/extension.html)

此外，Chrome Extensions 机制中还规定了 Content Script 约束条件，它虽然执行在页面进程中，但是它与页面中的脚本仅共享DOM，脚本内容本身是隔离的。

下图说明了这种机制：

**Chrome Extensions 机制图示**
![http://img104.ph.126.net/3MC8WeiEHNvEdNfhDnsoEg==/705094816662455827.jpg](http://img104.ph.126.net/3MC8WeiEHNvEdNfhDnsoEg==/705094816662455827.jpg)
![http://img624.ph.126.net/1t_BMDtn7M40Rc9EKzzwbQ==/1714182608169715238.jpg](http://img624.ph.126.net/1t_BMDtn7M40Rc9EKzzwbQ==/1714182608169715238.jpg)

由于这种机制的存在，我们必须将脚本注入到页面内，才可以使原本写在 **Content Script** 的代码可以运行在用户页面环境中，这样才有可能执行脚本钩子机制，对页面中某些 JS 方法做钩子注册。否则，在  **Content Script** 中注册的钩子是无法响应用户页面脚本程序触发的。

为了实现脚本钩子目的，我们在 **loader.js** 中建立了一种机制，先将 **Content Script** 内代码转换为字符串，再将代码字符串放置到 HTML 指定属性内，**通过 DOM 事件**将此字符串在页面内调用执行，从而达到检测代码注入用户页面的目的。

此外，由于这种注入代码方式跨越了 **Extensions** 的脚本隔离机制，我们又做出一项改进，即只有用户在点击高级检测选项卡后，才重新刷新页面，将检测程序注入页面，然后再经行检测工作。这种改进使得用户在不需要运行页面检测时，所执行的页面是干净无污染的。

基于以上原因，此项目的消息传递机制稍微复杂，同时会拥有扩展开发的标准通信API，内容还有基于 DOM 事件的消息传递内容。其中标准通信API由于是跨进程的，它是**异步**的， 而基于 DOM 的事件派发机制，由于JS的单线程机制，可以认为它是 **同步** 的。

**消息传递模型图示**
![http://img616.ph.126.net/75PhJ8ad_2sKbsTiqQcrZw==/1989465135393179347.jpg](http://img616.ph.126.net/75PhJ8ad_2sKbsTiqQcrZw==/1989465135393179347.jpg)