# Smartmd
![](https://xiaoqingxin.site/images/default_img.jpg)
<p align="center">
 <a href="./docs/api_EN.md">Documentation</a> | <a href="./docs/docs_CN.md">中文文档</a>
</p>
<p align="center">
<a href="https://travis-ci.org/NoisyWinds/laravel-smartmd"><img src="https://travis-ci.org/NoisyWinds/smartmd.svg?branch=master"></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square" alt="Software License"></img></a>
<a href="https://laravel.com"><img src="https://img.shields.io/badge/ie9-true-green.svg" alt="Software License"></img></a>
<a href="https://packagist.org/packages/noisywinds/laravel-smartmd"><img src="https://img.shields.io/packagist/v/NoisyWinds/smartmd.svg" alt="packagist"></img></a>
</p>
A markdown text editor compatible almost all markdown syntax, like Mathematical formula、flowchart、upload images...  

### Get smartmd

 
### Quickstart
```javascript
var editor = new Smartmd({
   el: "#editor",
   height: "400px"
});
```
### Build Setup
```node
# install reference
npm install

# build for development
npm run dev

# build for production
npm run build
```

### Features
- Markdown syntax parse by Markdown-It and it's plugins
- LaTeX mathematical expressions using KaTeX
- Diagrams and flowcharts using Mermaid
- Live preview 
- Emoji
- Images upload (need server)

### Issue
welcome repo bug reports, feature requests or optimization method.

### Reference:
- CodeMirror [link](https://github.com/codemirror/CodeMirror) 
- Simplemde-markdown [link](https://github.com/sparksuite/simplemde-markdown-editor)
- markdown-it (markdown render) [link](https://github.com/markdown-it/markdown-it)
- mermaid (flowchart) [link](https://github.com/knsv/mermaid)
