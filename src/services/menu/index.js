import getState from "../codemirror/getState"
import replaceSelection from "./replaceSelection"
import toggleCodeBlock from "./toggleCodeBlock"
import toggleBlock from "./toggleBlock"
import toggleHeading from "./toggleHeading"
import cleanBlock from "./cleanBlock"
import togglePreview from "./togglePreview"
import toggleRender from "./toggleRender"
import toggleFullScreen from "./toggleFullScreen"
import toggleLine from "./toggleLine"
import {def} from "../utils";

function toggleBold() {
  toggleBlock(this, "bold", this.options.blockStyles.bold);
}

function toggleItalic() {
  toggleBlock(this, "italic", this.options.blockStyles.italic);
}

function toggleStrikethrough() {
  toggleBlock(this, "strikethrough", this.options.blockStyles.strikethrough);
}

function toggleBlockquote() {
  toggleLine(this.codemirror, "quote");
}

function toggleHeadingSmaller() {
  toggleHeading(this.codemirror, "smaller");
}

function toggleHeadingBigger() {
  toggleHeading(this.codemirror, "bigger");
}

function toggleHeading1() {
  toggleHeading(this.codemirror, false, 1);
}

function toggleHeading2() {
  toggleHeading(this.codemirror, false, 2);
}

function toggleHeading3() {
  toggleHeading(this.codemirror, false, 3);
}

function toggleUnorderedList() {
  toggleLine(this.codemirror, "unordered-list");
}

function toggleOrderedList() {
  toggleLine(this.codemirror, "ordered-list");
}

function drawLink(text) {
  let stat = getState(this.codemirror);
  replaceSelection(this.codemirror, stat.link, this.options.insertTexts.link, text ? text : "");
}

function drawMath() {
  replaceSelection(this.codemirror, false, this.options.insertTexts.latex);
}

function drawChart() {
  replaceSelection(this.codemirror, false, this.options.insertTexts.chart);
}

function drawImage(text) {
  let stat = getState(this.codemirror);
  replaceSelection(this.codemirror, stat.image, this.options.insertTexts.image, text ? text : "");
}

function drawTable() {
  let stat = getState(this.codemirror);
  replaceSelection(this.codemirror, stat.table, this.options.insertTexts.table);
}

function drawHorizontalRule() {
  let stat = getState(this.codemirror);
  replaceSelection(this.codemirror, stat.image, this.options.insertTexts.horizontalRule);
}

function undo() {
  this.codemirror.undo();
  this.codemirror.focus();
}

function redo() {
  this.codemirror.redo();
  this.codemirror.focus();
}

export const menuList = {
  toggleBold,
  toggleItalic,
  drawLink,
  drawMath,
  toggleHeadingSmaller,
  toggleHeadingBigger,
  drawImage,
  toggleBlockquote,
  toggleOrderedList,
  toggleUnorderedList,
  toggleCodeBlock,
  togglePreview,
  toggleStrikethrough,
  toggleHeading1,
  toggleHeading2,
  toggleHeading3,
  cleanBlock,
  drawTable,
  drawChart,
  drawHorizontalRule,
  undo,
  redo,
  toggleRender,
  toggleFullScreen
};

export default function (editor) {
  for (let name in menuList) {
    if (menuList.hasOwnProperty(name)) {
      def(editor, name, menuList[name])
    }
  }
}
