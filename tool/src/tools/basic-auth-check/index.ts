import { FileExport } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Check Basic Auth Setting',
  path: '/basic-auth-check',
  description: 'Check Basic Auth Setting And Upload Domain by CSV To S3 Bucket',
  keywords: ['basic', 'auth', 'basic auth'],
  component: () => import('./index.vue'),
  icon: FileExport,
});
