<template>
  <n-card>
    <n-input v-model:value="text" type="textarea" placeholder="Your text..." rows="5" />
    <br />
    <br />
    <n-space justify="space-around">
      <n-statistic label="Character count" :value="text.length" />
      <n-statistic label="Word count" :value="text === '' ? 0 : text.split(/\s+/).length" />
      <n-statistic label="Line count" :value="text === '' ? 0 : text.split(/\r\n|\r|\n/).length" />
      <n-statistic label="Byte size" :value="formatBytes(getStringSizeInBytes(text))" />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { formatBytes } from '@/utils/convert';
import { ref } from 'vue';
import { getStringSizeInBytes } from './text-statistics.service';

const text = ref('');
</script>
