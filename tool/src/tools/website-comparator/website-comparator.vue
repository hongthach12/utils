<template>
  <n-card>
    <n-space vertical :size="16">
      <!-- Instructions -->
      <n-alert type="info" title="How to use">
        Enter two different website URLs and select what you want to compare. The tool will analyze meta tags and titles to show differences between the websites.
      </n-alert>
      <!-- URL Inputs -->
      <n-space vertical :size="12">
        <n-form-item 
          label="Website 1:" 
          :feedback="validation1?.message || ''" 
          :validation-status="validation1?.status || 'success'"
          :show-feedback="validation1?.status === 'error'"
        >
          <n-input 
            v-model:value="url1" 
            placeholder="https://example1.com" 
            :status="validation1?.status || 'success'"
          />
        </n-form-item>

        <n-form-item 
          label="Website 2:" 
          :feedback="validation2?.message || ''" 
          :validation-status="validation2?.status || 'success'"
          :show-feedback="validation2?.status === 'error'"
        >
          <n-input 
            v-model:value="url2" 
            placeholder="https://example2.com" 
            :status="validation2?.status || 'success'"
          />
        </n-form-item>
      </n-space>

      <!-- Comparison Options -->
      <n-form-item label="Compare Options:">
        <n-space vertical :size="8">
          <n-checkbox v-model:checked="compareOptions.metaTags">
            Meta Tags
          </n-checkbox>
          <n-checkbox v-model:checked="compareOptions.title">
            Title
          </n-checkbox>
        </n-space>
      </n-form-item>

      <!-- Validation Summary -->
      <n-alert v-if="validationSummary" type="warning" :title="validationSummary" />

      <!-- Debug Info (remove in production) -->
      <n-card size="small" v-if="false">
        <n-text>Debug: canCompare = {{ canCompare }}, validation1 = {{ validation1 }}, validation2 = {{ validation2 }}</n-text>
      </n-card>

      <!-- Compare Button -->
      <n-button 
        type="primary" 
        :disabled="!canCompare" 
        :loading="isLoading"
        @click="compareWebsites"
      >
        Compare Websites
      </n-button>

      <!-- Results -->
      <div v-if="comparisonResult">
        <n-divider />
        <n-space vertical :size="16">
          <n-h3>Comparison Results</n-h3>
          
          <!-- Summary Table -->
          <n-table :bordered="false" :single-line="false" size="small">
            <thead>
              <tr>
                <th>Comparison Type</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="compareOptions.title">
                <td><n-text strong>Title</n-text></td>
                <td>
                  <n-tag :type="titleMatch ? 'success' : 'warning'" size="small">
                    {{ titleMatch ? '✅ Match' : '❌ Different' }}
                  </n-tag>
                </td>
                <td>
                  <n-text v-if="titleMatch">Both websites have the same title</n-text>
                  <n-text v-else>Websites have different titles</n-text>
                </td>
              </tr>
              <tr v-if="compareOptions.metaTags">
                <td><n-text strong>Meta Tags</n-text></td>
                <td>
                  <n-tag :type="metaTagsMatchCount === Object.keys(metaTagsDiff).length ? 'success' : 'warning'" size="small">
                    {{ metaTagsMatchCount }}/{{ Object.keys(metaTagsDiff).length }} Match
                  </n-tag>
                </td>
                <td>
                  <n-text v-if="Object.keys(metaTagsDiff).length === 0">No meta tags found</n-text>
                  <n-text v-else-if="metaTagsMatchCount === Object.keys(metaTagsDiff).length">All meta tags match</n-text>
                  <n-text v-else>{{ Object.keys(metaTagsDiff).length - metaTagsMatchCount }} meta tags differ</n-text>
                </td>
              </tr>
            </tbody>
          </n-table>
          
          <!-- Title Comparison -->
          <div v-if="compareOptions.title">
            <n-h4>Title Comparison</n-h4>
            <n-table :bordered="false" :single-line="false" size="small">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Website 1</th>
                  <th>Website 2</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr :class="{ 'different-row': !titleMatch }">
                  <td><n-text strong>Title</n-text></td>
                  <td>
                    <span v-if="titleMatch">{{ comparisonResult.title1 || 'No title found' }}</span>
                    <span v-else v-html="highlightDifferences(comparisonResult.title1 || '', comparisonResult.title2 || '').text1"></span>
                  </td>
                  <td>
                    <span v-if="titleMatch">{{ comparisonResult.title2 || 'No title found' }}</span>
                    <span v-else v-html="highlightDifferences(comparisonResult.title1 || '', comparisonResult.title2 || '').text2"></span>
                  </td>
                  <td>
                    <n-tag :type="titleMatch ? 'success' : 'warning'" size="small">
                      {{ titleMatch ? '✅ Match' : '❌ Different' }}
                    </n-tag>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>

          <!-- Meta Tags Comparison -->
          <div v-if="compareOptions.metaTags">
            <n-h4>Meta Tags Comparison</n-h4>
            <n-table :bordered="false" :single-line="false" size="small">
              <thead>
                <tr>
                  <th>Meta Tag</th>
                  <th>Website 1</th>
                  <th>Website 2</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(diff, key) in metaTagsDiff" :key="key" :class="{ 'different-row': diff.status !== 'match' }">
                  <td><n-text code>{{ key }}</n-text></td>
                  <td>
                    <span v-if="diff.status === 'match'">{{ diff.value1 || 'Not found' }}</span>
                    <span v-else-if="diff.value1 && diff.value2" v-html="highlightDifferences(diff.value1, diff.value2).text1"></span>
                    <span v-else>{{ diff.value1 || 'Not found' }}</span>
                  </td>
                  <td>
                    <span v-if="diff.status === 'match'">{{ diff.value2 || 'Not found' }}</span>
                    <span v-else-if="diff.value1 && diff.value2" v-html="highlightDifferences(diff.value1, diff.value2).text2"></span>
                    <span v-else>{{ diff.value2 || 'Not found' }}</span>
                  </td>
                  <td>
                    <n-tag 
                      :type="diff.status === 'match' ? 'success' : 'warning'" 
                      size="small"
                    >
                      {{ diff.status === 'match' ? '✅ Match' : '❌ Different' }}
                    </n-tag>
                  </td>
                </tr>
                <tr v-if="Object.keys(metaTagsDiff).length === 0">
                  <td colspan="4">
                    <n-text type="secondary">No meta tags found to compare</n-text>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </n-space>
      </div>

      <!-- Error Message -->
      <n-alert v-if="errorMessage" type="error" :title="errorMessage" />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface ComparisonOptions {
  metaTags: boolean;
  title: boolean;
}

interface ComparisonResult {
  title1: string;
  title2: string;
  metaTags1: Record<string, string>;
  metaTags2: Record<string, string>;
}

interface MetaTagDiff {
  status: 'match' | 'different' | 'missing';
  value1?: string;
  value2?: string;
}

const url1 = ref('https://example.com');
const url2 = ref('https://example.org');
const isLoading = ref(false);
const errorMessage = ref('');
const comparisonResult = ref<ComparisonResult | null>(null);

const compareOptions = ref<ComparisonOptions>({
  metaTags: true,
  title: true,
});

// Simple validation functions
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getValidationStatus = (url: string) => {
  if (!url.trim()) {
    return { status: 'error' as const, message: 'Please enter a URL' };
  }
  if (!isValidUrl(url)) {
    return { status: 'error' as const, message: 'Please enter a valid URL (e.g., https://example.com)' };
  }
  return { status: 'success' as const, message: '' };
};

const validation1 = computed(() => getValidationStatus(url1.value));
const validation2 = computed(() => getValidationStatus(url2.value));

const validationSummary = computed(() => {
  const issues: string[] = [];
  
  if (validation1.value?.status === 'error') {
    issues.push('Website 1: ' + validation1.value.message);
  }
  if (validation2.value?.status === 'error') {
    issues.push('Website 2: ' + validation2.value.message);
  }
  if (!compareOptions.value.metaTags && !compareOptions.value.title) {
    issues.push('Please select at least one comparison option (Meta Tags or Title)');
  }
  if (validation1.value?.status === 'success' && validation2.value?.status === 'success' && url1.value === url2.value) {
    issues.push('Please enter different URLs for comparison');
  }
  
  return issues.length > 0 ? issues.join('. ') : null;
});

const canCompare = computed(() => {
  const url1Valid = url1.value.trim() !== '' && isValidUrl(url1.value);
  const url2Valid = url2.value.trim() !== '' && isValidUrl(url2.value);
  const hasOptions = compareOptions.value.metaTags || compareOptions.value.title;
  const differentUrls = url1.value !== url2.value;
  
  return url1Valid && url2Valid && hasOptions && differentUrls;
});

const titleMatch = computed(() => {
  if (!comparisonResult.value) return false;
  return comparisonResult.value.title1 === comparisonResult.value.title2;
});

const metaTagsDiff = computed(() => {
  if (!comparisonResult.value) return {};
  
  const diff: Record<string, MetaTagDiff> = {};
  const allKeys = new Set([
    ...Object.keys(comparisonResult.value.metaTags1),
    ...Object.keys(comparisonResult.value.metaTags2)
  ]);

  for (const key of allKeys) {
    const value1 = comparisonResult.value.metaTags1[key];
    const value2 = comparisonResult.value.metaTags2[key];

    if (value1 && value2) {
      diff[key] = {
        status: value1 === value2 ? 'match' : 'different',
        value1,
        value2,
      };
    } else if (value1) {
      diff[key] = {
        status: 'missing',
        value1,
      };
    } else {
      diff[key] = {
        status: 'missing',
        value2,
      };
    }
  }

  return diff;
});

const metaTagsMatchCount = computed(() => {
  return Object.values(metaTagsDiff.value).filter(diff => diff.status === 'match').length;
});

// Function to highlight differences in text
const highlightDifferences = (text1: string, text2: string) => {
  if (text1 === text2) return { text1, text2 };
  
  const minLength = Math.min(text1.length, text2.length);
  let diffStart = 0;
  
  // Find where the difference starts
  for (let i = 0; i < minLength; i++) {
    if (text1[i] !== text2[i]) {
      diffStart = i;
      break;
    }
  }
  
  // Find where the difference ends
  let diffEnd1 = text1.length;
  let diffEnd2 = text2.length;
  
  for (let i = 0; i < minLength - diffStart; i++) {
    if (text1[text1.length - 1 - i] !== text2[text2.length - 1 - i]) {
      diffEnd1 = text1.length - i;
      diffEnd2 = text2.length - i;
      break;
    }
  }
  
  const beforeDiff = text1.substring(0, diffStart);
  const afterDiff1 = text1.substring(diffEnd1);
  const afterDiff2 = text2.substring(diffEnd2);
  
  const diff1 = text1.substring(diffStart, diffEnd1);
  const diff2 = text2.substring(diffStart, diffEnd2);
  
  return {
    text1: beforeDiff + `<span class="highlight-diff">${diff1}</span>` + afterDiff1,
    text2: beforeDiff + `<span class="highlight-diff">${diff2}</span>` + afterDiff2
  };
};

async function compareWebsites() {
  if (!canCompare.value) return;

  isLoading.value = true;
  errorMessage.value = '';
  comparisonResult.value = null;

  try {
    // Create a proxy endpoint to avoid CORS issues
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    
    const [result1, result2] = await Promise.all([
      fetch(`${proxyUrl}${encodeURIComponent(url1.value)}`),
      fetch(`${proxyUrl}${encodeURIComponent(url2.value)}`)
    ]);

    if (!result1.ok || !result2.ok) {
      throw new Error('Failed to fetch websites');
    }

    const [data1, data2] = await Promise.all([
      result1.json(),
      result2.json()
    ]);

    if (data1.status?.http_code !== 200 || data2.status?.http_code !== 200) {
      throw new Error('One or both websites returned an error');
    }

    // Parse HTML content
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(data1.contents, 'text/html');
    const doc2 = parser.parseFromString(data2.contents, 'text/html');

    // Extract data
    const title1 = doc1.querySelector('title')?.textContent || '';
    const title2 = doc2.querySelector('title')?.textContent || '';

    const metaTags1: Record<string, string> = {};
    const metaTags2: Record<string, string> = {};

    // Extract meta tags
    doc1.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metaTags1[name] = content;
      }
    });

    doc2.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        metaTags2[name] = content;
      }
    });

    comparisonResult.value = {
      title1,
      title2,
      metaTags1,
      metaTags2,
    };

  } catch (error) {
    console.error('Error comparing websites:', error);
    errorMessage.value = error instanceof Error ? error.message : 'An error occurred while comparing websites';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="less" scoped>
// Override tool-content flex for this specific tool
// :deep(.tool-content > *) {
//   flex: 1 1 100% !important;
//   width: 100% !important;
//   max-width: 100% !important;
// }
.tool-content > * {
    flex: 0 1 100%;
}

.n-card {
  margin-bottom: 8px;
}

.n-table {
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  td {
    vertical-align: top;
    word-break: break-word;
  }
  
  .n-tag {
    margin: 0;
  }
  
  // Highlight differences
  .different-row {
    background-color: #fff3cd;
    
    &:hover {
      background-color: #ffeaa7;
    }
  }
  
  .highlight-diff {
    background-color: #ffeb3b;
    color: #000;
    font-weight: bold;
    padding: 2px 4px;
    border-radius: 2px;
  }
}
</style> 