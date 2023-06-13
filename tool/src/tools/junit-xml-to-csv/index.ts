import { FileExport } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Export CSV From Junit Reports',
  path: '/junit-report-to-csv',
  description: 'Generate CSV from JUnit reports',
  keywords: ['csv', 'junit', 'unit test', 'test'],
  component: () => import('./junit-xml-to-csv.vue'),
  icon: FileExport,
});
