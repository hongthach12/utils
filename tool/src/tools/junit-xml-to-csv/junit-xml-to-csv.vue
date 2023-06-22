<template>
  <div>
    <div class="form-center">
      <n-upload v-model="fileList" mode="drag" :on-before-upload="onUpload" :multiple="false" :max="1">
        <n-space justify="center">
          <n-button> Upload XML </n-button>
        </n-space>
      </n-upload>
      <n-form-item label="Chose Language:" label-placement="left">
        <n-space>
          <input id="php" type="radio" name="languageJunit" value="PHP" checked="true" :onChange="onChangeLanguage" />
          <label for="php">PHP</label><br />
          <input id="Python" type="radio" name="languageJunit" value="PYTHON" :onChange="onChangeLanguage" />
          <label for="Python">Python</label><br />
          <input id="NodeJs" type="radio" name="languageJunit" value="NODEJS" :onChange="onChangeLanguage" />
          <label for="NodeJs">NodeJs</label>
        </n-space>
      </n-form-item>

      <n-checkbox
        v-model="prettyClassTestCase"
        :on-update:checked="onChangePerrtyClassTestCase"
        label="Pretty Class Test Name"
        size="large"
      />
      <br /><br />
      <n-space>
        <n-button secondary autofocus @click="loadXML"> Load XML </n-button>
        <n-button secondary @click="exportTableToCSV"> Export CSV </n-button>
      </n-space>
      <br />
    </div>
    <table id="table-container" class="table"></table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const fileUpload = ref(null);
const fileList = ref([]);
const languageJunit = ref('PHP');
const prettyClassTestCase = ref(false);

async function onUpload({ file: { file } }) {
  if (file) {
    fileList.value = [];
    fileUpload.value = file;
  }
}

async function onChangeLanguage(e) {
  languageJunit.value = e.target.value ? e.target.value : 'PHP';
}

async function onChangePerrtyClassTestCase(value) {
  prettyClassTestCase.value = value;
}

function exportTableToCSV() {
  var file = fileUpload.value;
  if (!file) {
    alert('Upload XML Please!');
    return false;
  }
  var reader = new FileReader();
  let jsonData;
  reader.onload = function (e) {
    var xmlString = e.target.result;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    jsonData = getJsonData(xmlDoc);
    var csv = '';
    for (let i = 0; i < jsonData.length; i++) {
      csv += convertToCSV(jsonData[i], i);
    }
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

function loadXML() {
  var file = fileUpload.value;
  if (!file) {
    alert('Upload XML Please!');
    return false;
  }
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

function convertToCSV(jsonData, indexRow) {
  let className = jsonData?.class;
  delete jsonData?.class;
  var csv = '';
  if (indexRow === 0) {
    var headerRow = Object.keys(jsonData);
    var headerRowData = headerRow
      .map(function (key) {
        return '"' + mapheadJson(key) + '"';
      })
      .join(',');
    csv += headerRowData + '\n';
  }
  var rowDataTestSuilte = Object.values(jsonData)
    .map(function (value) {
      return '"' + value + '"';
    })
    .join(',');

  csv += rowDataTestSuilte + '\n';

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

function prettyClassTestCaseFormat(text) {
  if (prettyClassTestCase.value === false) {
    return text;
  }
  // Remove backslashes
  let formattedText = text.replace(/\\/g, '');

  // Check if the text is in camelCase or snake_case
  if (/[a-z]+_[a-z]+/i.test(formattedText)) {
    // Convert snake_case to human readable
    formattedText = formattedText.replace(/_/g, ' ').toLowerCase();
  } else if (/[a-z][A-Z]/.test(formattedText)) {
    // Convert camelCase to human readable
    formattedText = formattedText.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }

  return formattedText;
}
function getNodeDataTest(testSuite) {
  let testSuiteName = '';
  let testCaseName = '';
  let assertions = 0;
  switch (languageJunit.value) {
    case 'PHP':
      assertions = testSuite.getAttribute('assertions') ? testSuite.getAttribute('assertions') : 0;
      break;
    default:
      assertions = testSuite.getAttribute('assertions') ? testSuite.getAttribute('assertions') : 1;
      if (testSuite.nodeName === 'testsuite') {
        assertions = testSuite.getAttribute('tests');
      }
      break;
  }
  if (testSuite.nodeName === 'testsuite') {
    testSuiteName = testSuite.getAttribute('name')
      ? prettyClassTestCaseFormat(testSuite.getAttribute('name'))
      : 'Report Total';
  } else {
    testCaseName = testSuite.getAttribute('name') ? prettyClassTestCaseFormat(testSuite.getAttribute('name')) : '';
  }

  return {
    testSuite: testSuiteName,
    testCaseName: testCaseName,
    tests: testSuite.getAttribute('tests') ? testSuite.getAttribute('tests') : 0,
    assertions: assertions,
    errors: testSuite.getAttribute('errors') ? testSuite.getAttribute('errors') : 0,
    warnings: testSuite.getAttribute('warnings') ? testSuite.getAttribute('warnings') : 0,
    failures: testSuite.getAttribute('failures') ? testSuite.getAttribute('failures') : 0,
    skipped: testSuite.getAttribute('skipped') ? testSuite.getAttribute('skipped') : 0,
    time: testSuite.getAttribute('time'),
  };
}

function getJsonFromTestSuite(node) {
  let rootTestSuite = null;
  switch (languageJunit.value) {
    case 'PHP':
      rootTestSuite = node.getElementsByTagName('testsuite')[1];
      break;
    default:
      rootTestSuite = node;
      break;
  }
  var unitclassTestSuite = rootTestSuite.getElementsByTagName('testsuite');
  let json = [];
  for (let index = 0; index < unitclassTestSuite.length; index++) {
    let testSuilteCoverTestCase = unitclassTestSuite[index];
    json.push(pushJsonDataTestSuilte(testSuilteCoverTestCase));
  }
  return json;
}

function pushJsonDataTestSuilte(rootTestSuite) {
  var nodeTestUnit = getNodeDataTest(rootTestSuite);
  nodeTestUnit.class = [];
  let testCase = rootTestSuite.getElementsByTagName('testcase');
  for (let index = 0; index < testCase.length; index++) {
    let element = testCase[index];
    nodeTestUnit.class.push(getNodeDataTest(element));
  }
  return nodeTestUnit;
}

function getJsonData(xml) {
  return getJsonFromTestSuite(xml);
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

    tableBody = genereateRowTestSuilte(data, tableBody, rowIndex, false);
    table.appendChild(tableBody);
    rowIndex++;

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
  tableContainer.innerHTML = '';
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

function genereateRowTestSuilte(data, tableBody, rowIndex) {
  var row = document.createElement('tr');
  var cellNo = document.createElement('td');
  cellNo.textContent = rowIndex;
  row.appendChild(cellNo);

  for (var key in data) {
    if (key !== 'class') {
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
