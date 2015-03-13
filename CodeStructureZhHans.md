# 源代码目录结构 #

  * release/ 目录用来存放发布版本的源码，它通过定期从src目录 merge 获得；
  * src/ 目录用来存放compatibility-detector项目主干版本源码（基于主干开发）；
    * `_locales/` 目录为 i18n 信息存放目录，分别保存中文以及英文内容的 messsage.json 文件；
    * detectors/ 目录存放所有检测项目的算法文件，大部分情况下，每个算法文件为一个js文件，各别文件内存在多个简单的检测算法；
    * manifest.json 文件用来配置 detector 项目要检测的内容，这个文件是 Chrome Extensions 机制所要求的；
    * loader.js 文件用来向页面注入检测代码以及建立页面脚本与Content Script之间基于DOM事件的通信机制；
    * framework.js 为检测主框架代码，除实现必要的检测逻辑之外，还拥有大量的helper函数来辅助开发；
    * framework\_shared.js 作为框架辅助代码，只为实现页面脚本与Content Script之间共有内容而存在，它的作用是将同一脚本分别复制到页面与Content Script内运行，使两者都能使用同一共有数据结果或helper函数；
    * w3help\_issues.js 文件定义了w3help内根本原因的编号，用来配合检测内容定位相关错误；
    * annotation.js 文件用来在页面显示错误气泡提示；
    * config.js 文件用来配置项目相关细节，如最大错误气泡显示数量等；
    * constants.js 文件内是公用常量定义；
    * base\_detection.js 文件用来做基本检测相关内容；
    * options.html 选项页面
    * popup.html 基本检测以及高级检测页面
    * helper.js 相关页面文件所需要使用的公用函数
    * background.html 扩展后端进程页面
  * tests/ 目录用来存放compatibility-detector项目中，每个检测算法(detector)相关的测试用例；
  * tools/ 目录用来存放相关工具，如w3help内容页面的build工具；
  * w3help/ 目录用来存放w3help的相关文章内容