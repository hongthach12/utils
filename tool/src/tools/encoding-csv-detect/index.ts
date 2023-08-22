import { FileExport } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Detect CSV From Csv File',
  path: '/encoding-detect',
  description: 'Detect CSV Encoding',
  keywords: ['csv', 'Detect', 'encoding', 'SJIS'],
  component: () => import('./encoding.vue'),
  icon: FileExport,
});
