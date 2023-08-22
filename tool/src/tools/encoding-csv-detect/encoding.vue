<template>
  <div>
    <div class="form-center">
      <n-upload v-model="fileList" mode="drag" :on-before-upload="onUpload" :multiple="false" :max="1">
        <n-space justify="center">
          <n-button> Upload CSV </n-button>
        </n-space>
      </n-upload>
      <br />
      <n-space>
        <n-button secondary @click="detectCsvEncoding"> Detect Encoding </n-button>
      </n-space>
      <br />
      <p>Detected Encoding: {{ detectedEncoding }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Encoding from 'encoding-japanese';

const fileUpload = ref(null);
const detectedEncoding = ref(null);

async function onUpload({ file: { file } }) {
  if (file) {
    fileUpload.value = file;
  }
}

async function detectCsvEncoding() {
  if (fileUpload.value) {
    const file = fileUpload.value;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    detectedEncoding.value = Encoding.detect(uint8Array);
  }
}
</script>
