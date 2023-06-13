<template>
  <div>
    <n-card>
      <n-space align="center" justify="center">
        <div class="input-group mb-3"><input id="xmlFileInput" class="n-input" type="file" /></div>
      </n-space>
      <br /><br />
      <n-space justify="center">
        <n-button secondary autofocus @click="loadXML"> Load XML </n-button>
        <n-button secondary @click="exportTableToCSV"> Export CSV </n-button>
      </n-space>
    </n-card>
    <br /><br />
    <table id="table-container" class="table"></table>
  </div>
</template>

<script setup>
function exportTableToCSV() {
  var fileInput = document.getElementById('xmlFileInput');
  var file = fileInput.files[0];
  var reader = new FileReader();
  let jsonData;
  reader.onload = function (e) {
    var xmlString = e.target.result;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    jsonData = getJsonData(xmlDoc);
    var csv = convertToCSV(jsonData);
    var encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'table.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  reader.readAsText(file);
}

function convertToCSV(jsonData) {
  let className = jsonData[0]?.class;
  delete jsonData[0]?.class;
  var csv = '';

  // Generate the CSV header row
  var headerRow = Object.keys(jsonData[0]);
  var headerRowData = headerRow
    .map(function (key) {
      return '"' + mapheadJson(key) + '"';
    })
    .join(',');
  csv += headerRowData + '\n';

  // Generate the CSV data rows
  for (var i = 0; i < className.length; i++) {
    let testCase = className[i]?.testCase;
    delete className[i]?.testCase;
    let classData = className[i];
    var rowData = Object.values(classData)
      .map(function (value) {
        return '"' + value + '"';
      })
      .join(',');

    csv += rowData + '\n';

    if (testCase) {
      for (var j = 0; j < testCase.length; j++) {
        var testCaseData = testCase[j];
        var testCaseRowData = Object.values(testCaseData)
          .map(function (value) {
            return '"' + value + '"';
          })
          .join(',');
        csv += testCaseRowData + '\n';
      }
    }
  }

  return csv;
}

function getNodeDataTest(testSuite) {
  let testSuiteName = '';
  let testCaseName = '';
  if (testSuite.nodeName === 'testsuite') {
    testSuiteName = testSuite.getAttribute('name') ? testSuite.getAttribute('name') : 'Report Total';
  } else {
    testCaseName = testSuite.getAttribute('name') ? testSuite.getAttribute('name') : '';
  }

  return {
    testSuite: testSuiteName,
    testCaseName: testCaseName,
    tests: testSuite.getAttribute('tests') ? testSuite.getAttribute('tests') : 0,
    assertions: testSuite.getAttribute('assertions') ? testSuite.getAttribute('assertions') : 0,
    errors: testSuite.getAttribute('errors') ? testSuite.getAttribute('errors') : 0,
    warnings: testSuite.getAttribute('warnings') ? testSuite.getAttribute('warnings') : 0,
    failures: testSuite.getAttribute('failures') ? testSuite.getAttribute('failures') : 0,
    skipped: testSuite.getAttribute('skipped') ? testSuite.getAttribute('skipped') : 0,
    time: testSuite.getAttribute('time'),
  };
}

function getElementsByName(xml, tagName, name) {
  var elements = xml.getElementsByTagName(tagName);
  var matchingElements = [];

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.getAttribute('name') === name) {
      matchingElements.push(element);
    }
  }

  return matchingElements[0];
}

function loadXML() {
  var fileInput = document.getElementById('xmlFileInput');
  var file = fileInput.files[0];
  var reader = new FileReader();
  let jsonData;

  reader.onload = function (e) {
    var xmlString = e.target.result;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    jsonData = getJsonData(xmlDoc);
    displayJsonAsTable(jsonData);
  };

  reader.readAsText(file);
}

function pushJsonUnitAndFeature(node) {
  var unitclassTestSuite = node.getElementsByTagName('testsuite');
  var nodeTestUnit = getNodeDataTest(node);
  nodeTestUnit.class = [];
  for (let index = 0; index < unitclassTestSuite.length; index++) {
    var nodeTestUnitClass = getNodeDataTest(unitclassTestSuite[index]);
    nodeTestUnitClass.testCase = [];
    var unitTestCase = unitclassTestSuite[index].getElementsByTagName('testcase');
    for (let indexTestCase = 0; indexTestCase < unitTestCase.length; indexTestCase++) {
      let element = unitTestCase[indexTestCase];
      nodeTestUnitClass.testCase.push(getNodeDataTest(element));
    }
    nodeTestUnit.class.push(nodeTestUnitClass);
  }
  return nodeTestUnit;
}

function getJsonData(xml) {
  var jsonData = [];
  var outerTestSuite = xml.getElementsByTagName('testsuite')[0];

  //Push Data Unit
  var unitTestSuite = getElementsByName(outerTestSuite, 'testsuite', 'TestSuiltTotal');
  jsonData.push(pushJsonUnitAndFeature(unitTestSuite));
  return jsonData;
}

function displayJsonAsTable(jsonData) {
  var tableContainer = document.getElementById('table-container');
  var table = document.createElement('table');
  table.className = 'data-table';
  var tableBody = document.createElement('tbody');
  var rowIndex = 1;

  for (var i = 0; i < jsonData.length; i++) {
    var data = jsonData[i];

    var tableHead = document.createElement('thead');

    var headRow = document.createElement('tr');
    var thNo = document.createElement('th');
    thNo.textContent = 'No.';
    headRow.appendChild(thNo);

    for (var key in data) {
      if (key !== 'class') {
        var th = document.createElement('th');
        th.innerHTML = mapheadTable(key);
        headRow.appendChild(th);
      }
    }

    tableHead.appendChild(headRow);

    if (i === 0) {
      table.appendChild(tableHead);
    }

    if (data?.class) {
      for (let index = 0; index < data?.class.length; index++) {
        let element = data?.class[index];
        tableBody = genereateRowTestCase(element, tableBody, rowIndex);
        table.appendChild(tableBody);
        rowIndex++;
        if (element?.testCase) {
          element?.testCase.forEach((testCase) => {
            tableBody = genereateRowTestCase(testCase, tableBody, rowIndex);
            table.appendChild(tableBody);
            rowIndex++;
          });
        }
      }
    }
  }

  tableContainer.appendChild(table);
}

function genereateRowTestCase(data, tableBody, rowIndex) {
  var row = document.createElement('tr');
  var cellNo = document.createElement('td');
  cellNo.textContent = rowIndex;
  row.appendChild(cellNo);

  for (var key in data) {
    if (key !== 'testCase') {
      var cell = document.createElement('td');
      cell.textContent = data[key];
      row.appendChild(cell);
    }
  }

  return tableBody.appendChild(row);
}

function mapheadTable(key) {
  let returnLabel = key;
  switch (key) {
    case 'testSuite':
      returnLabel = '<pre>テストスイート \nTest suite </pre>';
      break;
    case 'testCaseName':
      returnLabel = '<pre>テストケース \nTest case </pre>';
      break;
    case 'tests':
      returnLabel = '<pre>テスト項目数 \nTotal Test</pre>';
      break;
    case 'assertions':
      returnLabel = '<pre>テストケース数 \nAssertions</pre>';
      break;

    case 'errors':
      returnLabel = '<pre>エラー \nErrors</pre>';
      break;

    case 'warnings':
      returnLabel = '<pre>警告 \nWarnings</pre>';
      break;

    case 'failures':
      returnLabel = '<pre>失敗 \nFailures</pre>';
      break;

    case 'skipped':
      returnLabel = '<pre>飛ばし \nSkipped</pre>';
      break;

    case 'time':
      returnLabel = '<pre>実装時間 \nTime</pre>';
      break;

    default:
      returnLabel = key;
      break;
  }
  return returnLabel;
}

function mapheadJson(key) {
  let returnLabel = key;
  switch (key) {
    case 'testSuite':
      returnLabel = 'テストスイート \nTest suite ';
      break;
    case 'testCaseName':
      returnLabel = 'テストケース \nTest case';
      break;
    case 'tests':
      returnLabel = 'テスト項目数 \nTotal Test';
      break;
    case 'assertions':
      returnLabel = 'テストケース数 \nAssertions';
      break;

    case 'errors':
      returnLabel = 'エラー \nErrors';
      break;

    case 'warnings':
      returnLabel = '警告 \nWarnings';
      break;

    case 'failures':
      returnLabel = '失敗 \nFailures';
      break;

    case 'skipped':
      returnLabel = '飛ばし \nSkipped';
      break;

    case 'time':
      returnLabel = '実装時間 \nTime';
      break;

    default:
      returnLabel = key;
      break;
  }
  return returnLabel;
}
</script>
