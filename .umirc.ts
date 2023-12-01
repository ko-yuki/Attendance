import { defineConfig } from 'umi';
import { resolve } from 'path';

export default defineConfig({
  alias: {
    '@page': resolve(__dirname, 'src/pages'),
    '@const': resolve(__dirname, 'src/const'),
    '@util': resolve(__dirname, 'src/utils'),
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  nodeModulesTransform: {
    type: 'none'
  },
  locale: {
    default: 'zh-CN',
    antd: true,
  },
  favicon: './favicon.ico',
  mfsu: {},
  fastRefresh: {},
  publicPath: './',
  history: {
    type: 'hash'
  },
  title: '自动考勤'
});
