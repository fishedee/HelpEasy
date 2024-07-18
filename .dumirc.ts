import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    name: '帮助中心',
    logo: '/logo.png',
    nav: [
      { title: '官网', link: 'https://www.balefcloud.com/' },
      { title: '下载', link: 'https://www.balefcloud.com/download.html' },
      { title: '登录', link: 'https://erp.balefcloud.com/' },
    ],
    footer: '<a href="https://beian.miit.gov.cn" target="_blank">粤ICP备2021083984号</a><span style="margin-left:10px;border-left:1px solid #5c5c5c;padding-left:10px;color:#333;">广东亿贸来科技有限公司</span>',
    prefersColor: {
      default: 'light',
      switch: false,
    },
    caches: false,
  },
});
