# HelpEasy

一个超级简单的工具，可以实现静态化部署：

- 企业文档
- 企业帮助中心
- 个人博客

## 功能

功能：

- 支持多级分类
- 支持 TOC 目录
- 支持 Markdown 文档编写
- 支持全局全文索引前端搜索
- 支持 Cicd 自动部署
- 免费！！！！！

感谢：

- 基于[dumi](https://d.umijs.org/guide)，修改了主题模板，更简洁直观
- 实现 markdown 转换器，自动添加 dumi 需要的 group 头部

效果在[这里](https://help.balefcloud.com)

## 编写文档

![](/public/img/2024-07-18-11-17-26.png)

- 在 contents 目录自由编写你的文档即可，默认按照时间顺序排序
- contents/config.json，配置类目的顺序，以及文章的顺序

```json
{
  "title": "帮助中心",
  "author": "fishedee",
  "inputDir": ".",
  "outputDir": "../docs",
  "category": [
    {
      "name": "更新记录",
      "articleOrder": "desc"
    },
    {
      "name": "快速入门",
      "articleOrder": "asc"
    }
  ]
}
```

config.json 文件，一般只需要更改 title,author,和 category 就可以了。

## 开发

```bash
$ make install
$ make dev
```

开发模式

```bash
$ make install
$ make dist
```

部署模式

```bash
$ cd cicd
$ ./build.sh
```

CICD 部署脚本

## LICENSE

GPL
