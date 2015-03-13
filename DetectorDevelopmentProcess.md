# Coding style #

The JavaScript source files should follow the coding style as much as possible: http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml

Each source file should contain proper copyright notice and Apache 2.0 license declaration at the top of the file.

All comments in source files should be in English.

Please be careful when using third-party sources to conform to their license agreements.

# Unit test #

Unit test files are put under /tests/ directory. Each detector should have at least one unit test file.

In most cases, a detector should have one unit test file which should have the same base name as the detector and a '.html' extension.

In rare cases, a detector needs more than one unit tests, for example, the detector needs to be tested in both Quirks and Standard modes. In this case, the names of the unit test files should all start with the name of the detector, with different trailings such as '`_q`' and '`_s`' for Quirks mode and Standard mode respectively.

The unit test file should use auto-test constructs as follows:

  * In the top level tag, declare which detector to test:
> `<html chrome_comp_test="detector_name">`

  * In each element which is expected have problem(s), declare the expected problems:
> `<button expectedProblems="SG9001 SD2002">`

  * For a non-element node which is expected to have problem(s), declare in the containing element:
> `<button expectedProblemsChild8="ST3002" expectedProblemsChild10="AB2003">`

> The number after `expectedProblemsChild` is the index of the child which is expected to have problems.

  * For script problems, use
> `chrome_comp.expectProblems(javascript_expression, "AB1234");`


When a unit test is loaded in the browser with the detector extension installed, the declared detector (with `chrome_comp_test` attribute) will be tested. If there are any mismatches between expected and actual results, the mismatches will be displayed in the developer tool console. All mismatches should be eliminated before a detector as well as its unit tests are submitted.

# Code review #

We follow a loose code review process. The developer can submit tested code (see above section for details) directly into SVN. Then anyone interested can review the change and give comments using the web UI of code.google.com. The author should respond to review comments and make changes accordingly.