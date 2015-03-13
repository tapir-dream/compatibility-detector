# 开发流程 #

## 如何获取原始代码 ##
项目源码保存在 Google Code 提供的 SVN 内，获取源码需要安装 SVN 客户端。

无提交权限的源代码针对任何对此项目感兴趣的人，它的获取地址为：

[http://compatibility-detector.googlecode.com/svn/trunk/](http://compatibility-detector.googlecode.com/svn/trunk/)

如果你已经是项目组成员，可以通过如下地址获取拥有提交权限的代码：

[https://compatibility-detector.googlecode.com/svn/trunk](https://compatibility-detector.googlecode.com/svn/trunk)

## 如何提交代码 ##

### 项目组成员如何提交代码 ###
项目组成员需要使用 [http://codereview.appspot.com/](http://codereview.appspot.com/) 平台提供检测内容，在没有通过其他成员review确认前，不能向代码库提交源码。
这是个流程规定，并没有硬性阻止向 SVN Commit 代码，但是如果没有经过 code review 会遭到其他成员谴责，该代码可能会从代码库中移除，直至通过 code review 为止。
详细内容可见**开发流程说明**。

### 非项目组成员如何提交代码 ###
非项目组成员可以将自己编写的检测代码发到项目组内，邮箱为: **`compatibility-detector-discuss[at]googlegroups.com`**
提交的代码由组内固定成员负责review，通过邮件组形式沟通实现细节，代码审核通过后由组内成员负责提交。


## 如何获取项目组成员资格 ##

### 固定成员 ###
固定成员可以直接向源码库提交检测代码，修复bug，review 其他成员代码质量。
固定成员可以由临时成员或项目组外其他成员，通过提交代码形式获得，我们的一般原则是：
同过邮件向组内提供三次检测源码，并均由其他固定成员 review 合格的，就可以转为项目的固定成员。

当然，由于开源项目基于Google的服务，我们希望成员注册一个Google账户（如Gmail）以便使用 code review 平台。

### 临时成员 ###
获得两个或两个以上项目组成员推荐就可获得临时成员资格。
临时成员可以直接向源码库中提交代码，经过其他成员复审合格共三次后，可成为项目组固定成员。
项目组某固定成员很长时间(2个月)未对项目作出贡献，将暂时划分到临时成员，直至提交代码三次复审合格后可恢复成员资格。

## 开发流程 ##

### 代码风格 ###
在编写代码前，请参照 Google 开源的 `JavaScript` 代码风格说明:

[http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)


每个源文件应该在文件的顶部适当的版权声明和Apache2.0许可声明。
```
/*
 * Copyright 2011 Google Inc.
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
```

每个检测算法源文件在版权说明下需要适当加入算法说明以及背景说明。如：
```
/**
 * @fileoverview Check the differences in performance of the 'text-align'
 * property on block level elements.
 * @bug https://code.google.com/p/compatibility-detector/issues/detail?id=34
 *
 * The 'text-align' property can apply to all kinds of elements including the
 * block level elements in W3C CSS 1 specification which IE6, IE7 and IE8
 * quirks mode follow, but in CSS2.1 specification, it changes to applying to
 * only the inline level elements or contents. So, this property can apply to
 * the block level elements in IE6/7/8.
 *
 * In CSS 1 specification, 'text-align' property describes how text is aligned
 * within the element, and all block-level elements in this element will be
 * affected.
 * IE6 IE7 IE8(Q) implemented in accordance with this specification.
 * In CSS2.1 specification, 'text-align' property describes how inline-level
 * content of a block container is aligned, so block-level elements in this
 * element will be affected.
 * IE8(S) Chrome implemented in accordance with this specification.
 *
 * This detector will check all nodes as the following:
 * 1. Ignore all text nodes, invisible elements and the elements having no
 *    parent.
 * 2. Ignore sub-elmement is have floats layout.
 * 3. Check the elements set the 'text-align' property, and it is not empty
 *    node, its offsetHeight is bigger than 0.
 * 4. Check for child elements whose width is less than the parent.
 */
```

所有的源文件都应该是英文的，包括注释哦。

谨慎的使用第三方的来源代码，别忘了在文件顶部注明第三方的许可证协议。

一定要注意，一行代码不可以超过 80 个字符，一次缩进为 2 个空格。


### 单元测试 ###

  1. 每个检测算法至少包含一个单元测试文件。
  1. 单元测试文件放置在 /tests/ 目录内，测试文件需要与检测算法文件命名一致。如果某个检测需要多于一个单元测试文件，那么可以在 /tests/目录内建立与检测算法文件命名一致的目录来存放它们。
  1. 如果单元测试运行在不同的文档模式下，请将文件名最后分别加上'**`_q`**'或'**`_s`**'，用来表示混杂模式或标准模式。用于检测近乎标准模式的页面建议是用'**`_a`**'结尾。
  1. 单元测试文件应使用自动测试结构如下：
    1. 在HTML标签，宣布该检测器进行测试：
> > > 

<html chrome\_comp\_test="detector\_name">


    1. 在每个预期有问题的元素的上声明预期的问题：
> > > 

&lt;button expectedProblems="SG9001 SD2002"&gt;


    1. 对于非元素节点，可以在父元素上申报预期的问题：
> > > 

&lt;button expectedProblemsChild8="ST3002" expectedProblemsChild10="AB2003"&gt;


> > > expectedProblemsChild[数值]是表示预计其后第几个子内容有问题
    1. 对于脚本问题，请使用：
> > > chrome\_comp.expectProblems(javascript\_expression, "AB1234");

当一个单元测试运行时，所声明的 chrome\_comp\_test属性将生效，表示这是单元测试文件，浏览器加载它时，检测工具将处于开启单元测试模式。如果有任何预期结果与实际结果不匹配，该机制将在开发工具的控制台中给出提示。检测器的作者应消除当前单元测试中所有不匹配的项后，才可进行代码 code review 流程。

单元测试的编码要求请具体参考项目中的实际单元测试文件，此处仅做简要说明：
  1. 单元测试文件必须包含完整的 HTML HEAD BODY 标签。
  1. 单元测试内的样式表设定尽可能达到最简化，样式表声明需按照字母顺序排列。
  1. 单元测试的有问题内容放置在一起，并尽量靠上，无问题内容放置在一起，并尽可能靠下；他们之间使用` <hr/> <h2>The followings don't have problems</h2>` 代码分割。
  1. 单元测试最后需用 `<p>(End of test)</p>` 代码表示用例结束。


### CODE REVIEW ###
  1. 注册一个Google账号（Gmail），它用来加入邮件组，并且用来登录 [http://codereview.appspot.com/](http://codereview.appspot.com/) 平台。
  1. 获取 depot 工具，地址为: [http://www.chromium.org/developers/how-tos/install-depot-tools](http://www.chromium.org/developers/how-tos/install-depot-tools)。用它来创建修改列表以及执行codereview 流程。其常用命令说明如下：
    1. gcl change your\_change\_list\_name  ——用来建立一个CL（Change List），或者用来修改一个LC，为其修改说明或增减内容。
    1. gcl changes ——列出所有已建立的CL。
    1. gcl rename your\_old\_change\_list\_name your\_new\_change\_list\_name ——用来修改一个LC的名称。
    1. gcl upload your\_change\_list\_name  -scodereview.appspot.com -r reviewer\_mail --cc compatibility-detector-dev@googlegroups.com --send\_mail ——用来将CL提交codereview，需要注意的是 -s 参数后面没有空格；-r参数用来指定一个或多个你希望review你代码的人，如果是多个人中间用逗号分割；--cc 参数将此review信息抄送全组；--send\_mail 用来指定是以邮件形式发送此信息。
    1. gcl commit  your\_change\_list\_name ——完成review后使用此命令提交CL到源码库中。
    1. gcl delete  your\_change\_list\_name ——删除无用的CL。

万事俱备后，我们来看看整体 codereview 流程：
  1. 修改代码，使用 gcl change 命令创建一个 CL；
  1. 在弹出的记事本窗口中选择你需要的文件列表，它们可能显示如下：
```
[HR9001] Detector meta tag charset
BUG=https://code.google.com/p/compatibility-detector/issues/detail?id=146
TEST=None

---All lines above this line become the description.
---Repository Root: D:\ProgramData\Windows\Desktop\comp-meta-charset
---Paths in this changelist (meta-charset):

A      src\detectors\meta_charset_and_http_header_charset.js
A      tests\charset_testcase.html
M      src\_locales\zh_CN\messages.json
M      src\_locales\en\messages.json
M      src\w3help_issues.js

---Paths modified but not in any changelist:
A     src\manifest.json
```

> 我们要做的是，将不需提交修改的文件放置在 **`---Paths modified but not in any changelist:`** 行下，将要修改的放置在 **`---Paths in this changelist(xxxx)`** 行下。并且要在第一行注明标准格式：

```
    [W3Help问题标号] Detector 检测问题简要说明
    BUG=compatibility-detector issues url
    TEST=None
```

> 其中 **`compatibility-detector issues url`** 可以在 [https://code.google.com/p/compatibility-detector/issues/](https://code.google.com/p/compatibility-detector/issues/) 中找到，如果没有可以在此URL下自己创建一个，并写到 `BUG=` 字符之后。

> 完成这些操作后，保存当前记事本，并关闭它，这样就建立好了一个CL。

  1. 保证CL无误后，执行 gcl upload 命令，将此CL提交至 [http://codereview.appspot.com/](http://codereview.appspot.com/) 平台等待review（命令行中会提示这个CL的URL地址）。
  1. 当 Reviewer 对你的CL提出修改建议后，你可以收到邮件并链接到 [http://codereview.appspot.com/](http://codereview.appspot.com/) 平台回应修改。
  1. 如果你觉得某条 Reviewer 的建议你可以修正，就在平台中此条目内容中回复 **`Done`**；否则在回复中说明你的理由。
  1. 将 Reviewer 所有建议处理完毕后，修正代码，执行 gcl upload 命令再次提交此CL。
  1. 在 [http://codereview.appspot.com/](http://codereview.appspot.com/) 平台中点击 **`Publish+Mail Comments`** 链接，勾选 **`Send Mail`** 选项后，点击 **`Publish All My Drafts`** 按键通知 Reviewer 你已经处理完成。
  1. Reviewer 收到通知后会继续审核你的代码。
  1. 重复执行 3-5 步，直到你指定的所有 Reviewer 都在平台中给出了 **`LGTM`** (Look Good To Me) 回复后，说明代码已经通过审核。
  1. 现在可以毫不犹豫的在你本地执行 gcl commit 命令，将以完成审核的CL提交至源码库。