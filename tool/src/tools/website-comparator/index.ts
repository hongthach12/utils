import { ArrowsLeftRight } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Website comparator',
  path: '/website-comparator',
  description:
    'Compare two websites by analyzing their meta tags, titles, and other properties to identify differences',
  keywords: ['website', 'comparator', 'compare', 'meta', 'tags', 'title', 'analysis', 'diff'],
  component: () => import('./website-comparator.vue'),
  icon: ArrowsLeftRight,
}); 