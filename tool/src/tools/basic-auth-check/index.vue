<template>
  <div>
    <div class="form-center">
      <n-space>
        <n-upload v-model="fileList" mode="drag" :on-before-upload="onUpload" :multiple="false" :max="1">
          <n-space justify="center">
            <n-button>Import CSV</n-button>
          </n-space>
        </n-upload>
        <n-button secondary :disabled="tableData.length === 0 || loading" @click="updateDomain">
          <span v-if="!loading">Update Domain</span>
          <span v-else>Loading...</span>
        </n-button>
        <n-button secondary :disabled="loading" @click="testBasicAuth"> Test Basic Auth </n-button>
      </n-space>
      <n-button text tag="a" target="_blank" rel="noopener" type="primary" depth="3" :href="`sample.csv`">
        File CSV Sanmple
      </n-button>
      <br /><br />

      <br />
    </div>
    <table id="table-container" class="table">
      <tbody>
        <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
          <!-- Dữ liệu của bảng -->
          <td v-for="(column, columnIndex) in row" :key="columnIndex">{{ column }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const fileList = ref([]);
const tableData = ref([]);
const loading = ref(false);

const URL_LAMBDA = import.meta.env.VITE_URL_LAMBDA;
function onUpload(file) {
  const allowedExtensions = ['text/csv'];

  // Kiểm tra phần mở rộng của tệp
  const fileExtension = file?.file?.type.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    alert('Only Csv');
    return false;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    const csvData = event.target.result;
    const data = parseCSV(csvData);
    // Xử lý dữ liệu CSV ở đây
    tableData.value = data;
  };
  // Đọc nội dung của tệp CSV
  reader.readAsText(file?.file.file);
}

function parseCSV(csvData) {
  const rows = csvData.split('\n');
  const data = [];

  // Phân tích từng dòng của tệp CSV
  rows.forEach((row) => {
    const columns = row.split(',');
    if (columns[0] !== '') {
      data.push(columns);
    }
  });
  return data;
}
async function updateDomain() {
  try {
    if (tableData.value.length > 0) {
      tableData.value.shift();
    }
    loading.value = true;
    const response = await fetch(`${URL_LAMBDA}/dev/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableData.value),
    });
    const data = await response.json();
    if (data.statusCode === 200) {
      loading.value = false;
      alert('Update Domain Success');
    }
    tableData.value = [];
  } catch (error) {
    loading.value = false;
    alert(error);
  }
}

async function testBasicAuth() {
  try {
    const response = await fetch(`${URL_LAMBDA}/dev/dispath-csv-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.statusCode === 200) {
      alert('Check Email Chanel S7');
    }
    console.log(data);
  } catch (error) {
    alert(error);
    console.error('Error fetching data:', error);
  }
}
</script>
