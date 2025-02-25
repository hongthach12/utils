import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Draw map',
  path: '/draw-map',
  description: '',
  keywords: ['draw', 'map'],
  component: () => import('./draw-map.vue'),
  icon: ArrowsShuffle,
});