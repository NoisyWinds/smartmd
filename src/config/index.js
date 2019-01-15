import shortcuts from './shortcuts'
import alertTheme from './alertTheme'
import MarkdownItConfig from './MarkdownItConfig'
import CodeMirrorConfig from './CodeMirrorConfig'
import toolbarConfig from './toolbar'

const blockStyles = {
  bold: "**",
  code: "```",
  italic: "*",
  strikethrough: "~~"
};

const insertTexts = {
  link: ["[link name](https://", "#text#)"],
  image: ["![](https://", "#text#)"],
  table: ["", "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n"],
  horizontalRule: ["", "\n\n-----\n\n"],
  latex: ["$$\n\\begin{cases}3x + 5y +  z \\\\ 7x - 2y + 4z \\\\ -6x + 3y + 2z \\end{cases}", "\n$$"],
  chart: ["```\ngraph LR\nA[Square Rect] -- Link text --> B((Circle))\nA --> C(Round Rect)\nB --> D{Rhombus}\nC --> D", "\n```"]
};


export default {
  isFullScreen: false,
  isPreviewActive: false,
  statusbar: ['block', 'autoSave', 'lines', 'words', 'cursor'],
  uploadsPath: "./upload",
  uploads: {
    type: ['jpeg', 'png', 'bmp', 'gif', 'jpg'],
    maxSize: 4096,
    typeError: 'Image support format {type}.',
    sizeError: `Image size is more than {maxSize} kb.`,
    serverError: `Upload failed on {msg}`
  },
  alertDelay: 5000,
  blockStyles,
  insertTexts,
  alertTheme,
  shortcuts,
  MarkdownItConfig,
  CodeMirrorConfig,
  toolbarConfig
}
