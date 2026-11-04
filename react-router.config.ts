import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: ['/', '/kiem-tra'],
} satisfies Config;
