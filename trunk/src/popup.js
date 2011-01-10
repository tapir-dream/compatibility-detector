void function() {

  var DEFAULT_LOCALE = 'zh-cn'; // TODO: change to en when w3help ready.
  var W3HELP_LOCALES = {
    'en': true,
    'zh-cn': true
  };

  var w3helpLocale = chrome.i18n.getMessage('@@ui_locale');
  if (w3helpLocale)
    w3helpLocale = w3helpLocale.toLowerCase().replace('_', '-');
  if (!W3HELP_LOCALES.hasOwnProperty(w3helpLocale))
    w3helpLocale = DEFAULT_LOCALE;
  w3helpLocale = 'http://www.w3help.org/' + w3helpLocale;

  function stringTemplate(param) {
    return param.str.replace(param.regexp || /\${([^{}]*)}/g,
        function(a,b) {
          var r = param.obj[b];
          return (typeof r == "string") ? r : a ;
        })
  }

  function $(id) {
    return document.getElementById(id);
  }

  function bulidHTMLView(templateObject, element) {
    var HTMTemplate = element.innerHTML;
    element.innerHTML = stringTemplate({
      str: HTMTemplate,
      obj: templateObject
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    // HTMLView i18n
    bulidHTMLView({
      popup_cannotDetect: chrome.i18n.getMessage('popup_cannotDetect'),
      popup_loading: chrome.i18n.getMessage('popup_loading'),
      popup_baseDetection: chrome.i18n.getMessage('popup_baseDetection'),
      popup_advancedDetection: chrome.i18n.getMessage(
          'popup_advancedDetection'),
      popup_detecting: chrome.i18n.getMessage('popup_detecting'),
      popup_noProblem: chrome.i18n.getMessage('popup_noProblem'),
      popup_issueDescription: chrome.i18n.getMessage('popup_issueDescription'),
      popup_issueCount: chrome.i18n.getMessage('popup_issueCount'),
      popup_checkboxEffectTip: chrome.i18n.getMessage('popup_checkboxEffectTip')
    }, $('warp'));

    var $body = document.body;
    var $tab = $('tab');
    var $content = $('content');
    var $baseDetection = $('base_detection');
    var $advancedDetection = $('advanced_detection');

    var backgroundPage = chrome.extension.getBackgroundPage();

    /**
     * Show base detection resault.
     */
    function showBaseDetectionResault(data) {
      $content.className = 'processing';
      var result = [];

      var KB001 = chrome.i18n.getMessage('bd_aboutRCAorKB') +
          '<a href="' + w3helpLocale +
          '/kb/001" target="_blank">' +
          chrome.i18n.getMessage('KB001') + '</a>。';

      if (data.documentMode.pageDTD) {
        result.push('<li>' + chrome.i18n.getMessage('bd_hasDTD'));
        if (data.documentMode.strangeName ||
            data.documentMode.strangePublicId ||
            data.documentMode.strangeSystemId)
          result.push(chrome.i18n.getMessage('bd_strangeDTD'));
        if (data.documentMode.hasCommentBeforeDTD)
          result.push(chrome.i18n.getMessage('bd_makeIEBeInQuirksMode') +
              chrome.i18n.getMessage('bd_aboutRCAorKB') +
              '<a href="' + w3helpLocale +
              '/causes/HG8001" target="_blank">' +
              chrome.i18n.getMessage('HG8001') +
              '</a>。');
        if (data.documentMode.compatMode.IE ==
            data.documentMode.compatMode.WebKit) {
          var mode = (data.documentMode.compatMode.WebKit == 'S')
              ? chrome.i18n.getMessage('bd_S')
              : chrome.i18n.getMessage('bd_Q');
          result.push(chrome.i18n.getMessage('bd_sameDTD', [
            '<em>' + chrome.i18n.getMessage('bd_same') + '</em>',
            '<em>'+ mode + '</em>'
          ]));
          if (data.documentMode.compatMode.WebKit == 'Q') {
            result.push(chrome.i18n.getMessage('bd_sameDTD', [
              '<em>' + chrome.i18n.getMessage('bd_same') + '</em>',
              '<em>'+ mode + '</em>'
            ]));
            result.push(chrome.i18n.getMessage('bd_inQuirksMode', [
              '<strong>' + chrome.i18n.getMessage('bd_Q') + '</strong>'
            ]) + chrome.i18n.getMessage('bd_reducePossibility') + KB001);
          }
          result.push('</li>');
        } else {
          result.push('<li>' + chrome.i18n.getMessage('bd_differentDTD',[
            '<strong>' + chrome.i18n.getMessage('bd_different') + '</strong>'
          ]) + chrome.i18n.getMessage('bd_reducePossibility') +
              KB001 + '</li>');
        }
      } else {
        result.push('<li>' + chrome.i18n.getMessage('bd_noDTD', [
          '<strong>' + chrome.i18n.getMessage('bd_Q') + '</strong>'
        ]) + chrome.i18n.getMessage('bd_reducePossibility') + '</li>');
      }
      // Process data.DOM to HTML
      result.push('<li>' +
          chrome.i18n.getMessage('bd_nodeCount', [
            '<em>' + data.DOM.count + '</em>'
          ]) + '</li>');

      if (data.DOM.IECondComm.length)
        result.push('<li>' +
            chrome.i18n.getMessage('bd_IECondCommCount', [
              '<strong>' + data.DOM.IECondComm.length + '</strong>'
            ]) + '</li>');
      // Process data.HTMLBase.HTMLDeprecatedTag to HTML
      var deprecatedTag = [];
      for (var tag in data.HTMLBase.HTMLDeprecatedTag) {
        deprecatedTag.push(tag);
      }
      var deprecatedTagLength = deprecatedTag.length;
      if (deprecatedTagLength) {
        for (var i = 0; i < deprecatedTagLength; ++i) {
          result.push('<li>' +
              chrome.i18n.getMessage('bd_hasDeprecatedTag', [
                '<strong>' + deprecatedTag[i] + '</strong>'
              ]) + '</li>');
        }
      } else {
        result.push('<li>' +
            chrome.i18n.getMessage('bd_noDeprecatedTag') + '</li>');
      }
      // Process data.HTMLBase.HTMLDeprecatedAttribute to HTML
      var tagsHaveDeprecatedAttributes =
          Object.keys(data.HTMLBase.HTMLDeprecatedAttribute);
      var tagsLength = tagsHaveDeprecatedAttributes.length;
      if (tagsLength) {
        for (var i = 0; i < tagsLength; ++i) {
          var tagListString = [];
          var attrs =
              data.HTMLBase.HTMLDeprecatedAttribute[tagsHaveDeprecatedAttributes[i]];
          for (var attr in attrs) {
            tagListString.push(attr);
          }
          result.push('<li>' +
              chrome.i18n.getMessage('bd_hasDeprecatedAttribute',[
                '<strong>' + tagsHaveDeprecatedAttributes[i] + '</strong>',
                '<strong>' + tagListString.join(' ') + '</strong>'
              ]) + '</li>');
        }
      } else {
        result.push('<li>' +
            chrome.i18n.getMessage('bd_noDeprecatedAttribute') + '</li>');
      }
      // Show result.
      $baseDetection.innerHTML = result.join('');
      $content.className = '';
    }

    /**
     * Change pop-up page's status.
     */
    function setStatus(status) {
      switch (status) {
        case 'disabled':
          $body.className = 'disabled';
          break;
        case 'loading':
          $body.className = 'loading';
          break;
        case 'base':
          $body.className = 'base';
          baseDetection();
          break;
        case 'advanced':
          $body.className = 'advanced';
          advancedDetection();
          break;
      }
    }


    var tabId = null;
    var baseDetection = null;
    window.updateSummary = function() {};
    window.updateDetectionResult = function() {};
    window.showNoProblemResult = function() {};
    window.restoreAnnotationCheck = function() {};
    chrome.tabs.getSelected(null, function(tab) {
      // Get current tab's id, many functions need it.
      tabId = tab.id;

      function checkPermission(callback) {
        var timer = setTimeout(function() {
          $body.className = 'disabled';
        }, 100);
        chrome.tabs.sendRequest(tabId, {type: 'checkPermission'}, function() {
          clearTimeout(timer);
          if (callback) callback();
        });
      }
      checkPermission();

      // Get current tab's detectionType.
      chrome.tabs.sendRequest(tabId, {type: 'getDetectionType'},
          function(detectionType) {
          setStatus(detectionType ? detectionType : 'loading');
          // If the page reloaded for advanced detect, the pop-up page's status
          // will be 'advanced', but base detection must run, the BrowserAction
          // need the detection result.
          if (detectionType == 'advanced' && $baseDetection.innerHTML == '') {
            baseDetection();
          }
      });

      // Change status when tab loaded or refreshed.
      chrome.tabs.onUpdated.addListener(function(updatedTabId, changeInfo) {
        if (tabId == updatedTabId) {
          if (changeInfo.status == 'complete') {
            $baseDetection.innerHTML = '';
            checkPermission(function() {
              chrome.tabs.sendRequest(tabId, {type: 'getDetectionType'},
                  function(detectionType) {
                    // Same with "Get current tab's detectionType" part.
                    if (detectionType == 'advanced') baseDetection();
                    setStatus(detectionType);
              });
            });
          } else {
            setStatus('loading');
          }
        }
      });

      // Change the tab panel.
      $tab.addEventListener('click', function(event) {
        var currentStatus = $body.className;
        var status = event.target.className;
        if (status && currentStatus != status) {
          chrome.tabs.sendRequest(tabId,
              {type: 'setDetectionType', detectionType: status},
              function(detectionType) {
            setStatus(detectionType);
          });
        }
      });

      // Base detection.
      baseDetection = function() {
        chrome.tabs.sendRequest(tabId, {type: 'baseDetection'},
            showBaseDetectionResault);
      }

      function getDetectionResult(tabId) {
        return backgroundPage.getDetectionResult(tabId);
      }
      function detectProblems() {
        chrome.tabs.sendRequest(tabId, {type: 'DetectProblems'});
      }

      /**
       * Advanced detection.
       */
      window.advancedDetection = function() {
        var detectionResult = getDetectionResult(tabId);
        // If detection finished, then show result from cache.
        if (detectionResult.detected) {
          var problems = detectionResult.problems;
          if (Object.keys(problems).length == 0) {
            showNoProblemResult();
          } else {
            for (var typeId in problems) {
              var problem = problems[typeId];
              updateDetectionResult(typeId, problem);
              updateSummary(problem.severity);
            }
            restoreAnnotationCheck();
          }
        } else {
          detectProblems();
        }
      }

      /**
       * function updateSummary
       * @param {error | warning} type
       */
      window.updateSummary = function(type) {
        var detectionResult = getDetectionResult(tabId);
        var number = type == 'warning' ? 'totalWarnings' : 'totalErrors';
        var summary = chrome.i18n.getMessage(type + 'ProblemsSummary',
            [detectionResult[number]]);
        var allProblemsSummary = chrome.i18n.getMessage('allProblemsSummary',
            [detectionResult.totalProblems]);
        $(type + 'ProblemsSummary').innerHTML = summary;
        $('allProblemsSummary').innerHTML = allProblemsSummary;
      }

      window.updateDetectionResult = function(typeId,
                                              problem,
                                              calledByAddProblem) {
        var detectionResult = getDetectionResult(tabId);
        var occurrencesNumber = problem.occurrencesNumber;
        // Prevent adding one problem repeatedly.
        if (calledByAddProblem &&
            detectionResult.problems[typeId] &&
            occurrencesNumber ==
                detectionResult.problems[typeId].occurrencesNumber)
          return;

        var severity = problem.severity;
        $content.className = '';
        $('detectionResult').style.display = 'block';
        $(severity + 'Area').style.display = 'block';
        var table = $(severity + 'Problems').firstElementChild;
        var problemRow = $(typeId);
        if (problemRow) {
          problemRow.cells[2].innerText = occurrencesNumber;
        } else {
          var row = document.createElement('tr');
          row.setAttribute('id', typeId);
          table.appendChild(row);
          insertCell(row, problem.occurrencesNumber);
          insertCell(row, problem.description);
          var checkbox = insertCell(row, '<input type="checkbox" name="' +
              severity + '" class="issue">').firstElementChild;
          checkbox.addEventListener('click', toggleCheckProblem, false);
        }

        function insertCell(row, html) {
          var cell = row.insertCell(0);
          cell.innerHTML = html;
          return cell;
        }
      }

      window.showNoProblemResult = function() {
        $content.className = '';
        $('noProblemFoundInfo').style.display = 'block';
      }

      /**
       * Update annotation status
       * @param {Array} checkboxes
       */
      function updateAnnotatedStatus(checkboxes) {
        var detectionResult = getDetectionResult(tabId);
        var annotatedProblems = detectionResult.annotatedProblems;
        checkboxes.forEach(function(checkbox) {
          var issueId = checkbox.parentNode.parentNode.id;
          if (annotatedProblems[issueId] && !checkbox.checked)
            delete annotatedProblems[issueId];
          else if (!annotatedProblems[issueId] && checkbox.checked)
            annotatedProblems[issueId] = issueId;
        });
        return Object.keys(annotatedProblems);
      }

      /**
       * Handle one checkbox click event.
       */
      function toggleCheckProblem() {
        var annotatedProblems = updateAnnotatedStatus([this]);
        backgroundPage.annotate(annotatedProblems);
        updateCheckAllStatus(this);
      }

      /**
       * Handle check all or check no checkbox click event.
       * @param {Element} checkAll
       * @param {String} type
       */
      function toggleCheckAllProblems(checkAll, type) {
        var checkboxes =
            Array.prototype.slice.call(document.getElementsByName(type));
        var checked = checkAll.checked;
        checkboxes.forEach(function(checkbox) {
          checkbox.checked = checked;
        });
        var problems = updateAnnotatedStatus(checkboxes);
        backgroundPage.annotate(problems);
      }

      function updateCheckAllStatus(checkbox) {
        var checkAll = $(checkbox.name + 'CheckAll');
        if (checkbox.checked) {
          var checkboxes = document.getElementsByName(checkbox.name);
          for (var i = 0, length = checkboxes.length; i < length; ++i) {
            if (!checkboxes[i].checked) {
              return;
            }
          }
          checkAll.checked = true;
        } else {
          checkAll.checked = false;
        }
      }

      window.restoreAnnotationCheck = function() {
        var detectionResult = getDetectionResult(tabId);
        var annotatedProblems = detectionResult.annotatedProblems;
        Object.keys(annotatedProblems).forEach(function(issueId) {
          $(issueId).firstElementChild.firstElementChild.checked = true;
        });
        restoreCheckAll(document.getElementsByName('warning'), 'warning');
        restoreCheckAll(document.getElementsByName('error'), 'error');

        function restoreCheckAll(checkboxes, type) {
          for (var i = 0, length = checkboxes.length; i < length; ++i) {
            if (!checkboxes[i].checked)
              return;
          }
          $(type + 'CheckAll').checked = true;
        }
      }

      $('errorCheckAll').addEventListener('click', function() {
        toggleCheckAllProblems(this, 'error');
      }, false);

      $('warningCheckAll').addEventListener('click', function() {
        toggleCheckAllProblems(this, 'warning');
      }, false);

    });
  },false);
}();