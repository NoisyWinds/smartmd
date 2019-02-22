# 介绍文档
![](https://xiaoqingxin.site/images/default_img.jpg)

## 示例网站
editor demo: [Demo](https://xiaoqingxin.site/editor/write)   
js render page [Demo](https://xiaoqingxin.site/editor/js-show)  
php render page [Demo](https://xiaoqingxin.site/editor/php-show)

## 如何使用
```node
# install reference
npm install smartmd 

# build for development
npm run dev

# build for production
npm run build
```
## 快速开始
```javascript
var editor = new Smartmd({
   el: "#editor",
   height: "400px"
});
```

## 实用的一些功能
```javascript
var editor = new Smartmd({
   // editor element {string} 
   el: "#editor",
   
   // editor wrapper layout {string or number}
   height: "400px",
   width: "100%",
   
   // autosave 
   autoSave: {
     // uuid is required {string or number}
     uuid: 1,
     // {number}
     delay: 5000
   },
   
   // init state {boolean}
   isFullScreen: true, // default false
   isPreviewActive: true // default false
});
```

## 更多的设置
```javascript
const options = {
   // editor element {string} 
   el: "#editor",
   
   // editor wrapper layout {string or number}
   height: "400px",
   width: "100%",
   
   // autosave 
   autoSave: {
     // uuid is required {string or number}
     uuid: 1,
     // {number}
     delay: 5000
   },
   
   // init state {boolean}
  isFullScreen: true, // default false
  isPreviewActive: true, // default false
  
  // upload image (need server)
  uploads: {
    type: ['jpeg', 'png', 'bmp', 'gif', 'jpg'],
    maxSize: 4096,
    typeError: 'Image support format {type}.',
    sizeError: 'Image size is more than {maxSize} kb.',
    serverError: 'Upload failed on {msg}' 
  },
  // statusbar default
  statusbar: ['block', 'autoSave', 'lines', 'words', 'cursor'],
  
  // alert hidde delay
  alertDelay: 5000,
  
  // insert Text default #text# is replace text
  insertTexts:{
    link: ["[link name](https://", "#text#)"],
    image: ["![](https://", "#text#)"],
    table: ["", "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n"],
    horizontalRule: ["", "\n\n-----\n\n"],
    latex: ["$$\n\\begin{cases}3x + 5y +  z \\\\ 7x - 2y + 4z \\\\ -6x + 3y + 2z \\end{cases}", "\n$$"],
    chart: ["```\ngraph LR\nA[Square Rect] -- Link text --> B((Circle))\nA --> C(Round Rect)\nB --> D{Rhombus}\nC --> D", "\n```"]
  },
  
  // default blockStyles 
  blockStyles:{
    bold: "**",
    code: "```",
    italic: "*",
    strikethrough: "~~"
  },
  // default CodeMirrorConfig
  CodeMirrorConfig:{
       mode: "smartmd", // change mode some highligh will disappear
       theme: "paper",
       tabSize: 2,
       indentUnit: 2,
       indentWithTabs: true,
       lineNumbers: false,
       autofocus: false,
       lineWrapping: true,
       allowDropFileTypes: ["text/plain"],
       autoCloseTags: false,
       matchTags: {bothTags: true},
       placeholder: "Please enter the text ...", // default placeholder
       styleSelectedText: true
  },
  // default MarkdownItConfig
  MarkdownItConfig:{
       options: {
         langPrefix: 'language-',
         breaks: true
       },
       plugins:['mermaid','katex','emoji'] // extand yourself plugins
  },
  // default shortcuts auto compatible ios system
  shortcuts: {
       toggleBold: "Ctrl-B",
       toggleItalic: "Ctrl-I",
       drawLink: "Ctrl-K",
       toggleHeadingSmaller: "Ctrl-H",
       toggleHeadingBigger: "Shift-Ctrl-H",
       cleanBlock: "Ctrl-E",
       drawMath: "Ctrl-M",
       drawImage: "Ctrl-P",
       toggleBlockquote: "Ctrl-'",
       toggleOrderedList: "Ctrl-Alt-L",
       toggleUnorderedList: "Ctrl-L",
       toggleCodeBlock: "Ctrl-Alt-C",
       togglePreview: "F9",
       toggleRender: "Ctrl-P",
       toggleFullScreen: "F11",
       drawChart: "Ctrl-Alt-M",
       autoSaveUpdate: "Ctrl-S"
  },
  // default alertTheme
  alertTheme: {
         success: {
           icon: "fa fa-check-circle",
           className: "smartmd__alert__item--success",
           defaultText: "Completed"
         },
         error: {
           icon: "fa fa-close-circle",
           className: "smartmd__alert__item--danger",
           defaultText: "Some things wrong"
         }
  },
  // default all tools and you can set your used
  toolbar:["heading-1"]
}

```


## API

```javascript
let editor = new Smartmd({el: "#eidtor"})

// toolbar functions
editor.toggleBold();
editor.toggleItalic();
editor.toggleStrikethrough();
editor.toggleBlockquote();
editor.toggleHeadingSmaller();
editor.toggleHeadingBigger();
editor.toggleHeading1();
editor.toggleHeading2();
editor.toggleHeading3();
editor.toggleUnorderedList();
editor.toggleOrderedList();
editor.drawLink("your link");
editor.drawMath();
editor.drawChart();
editor.drawImage("your image url");
editor.drawTable();
editor.drawHorizontalRule();
editor.undo();
ediotr.redo();

// toggle preview
editor.togglePreview();
// toggleRenderBox 
editor.toggleRender();
// toggleFullScreenl
editor.toggleFullScreen();

// value watcher
editor.options.isFixedToolbar = false;
editor.options.isFullScreen = false;
editor.options.isPreviewActive = false;
editor.options.width = "800px";
editor.options.height = "80vh";
```





