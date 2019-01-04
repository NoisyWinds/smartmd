import CodeMirror from 'codemirror';
import {addClass, getClass, removeClass} from "../utils";


export default function (editor, cm) {
  CodeMirror.on(cm.display.lineDiv, "dragenter", (ev) => {
    ev.preventDefault();
    if (getClass(ev.target, "CodeMirror-line")) addClass(ev.target, "line-dragenter");
    return false;
  });

  CodeMirror.on(cm.display.lineDiv, "drop", (ev) => {
    ev.preventDefault();
    if (!getClass(ev.target, "CodeMirror-line")) return;
    removeClass(ev.target, "line-dragenter");
    let files = ev.dataTransfer.files;
    if (!files) return;
    let lineNumber = cm.lineAtHeight(ev.pageY);
    cm.setCursor(lineNumber, 0);
    for (let i = 0; i < files.length; i++) {
      editor.uploadImages(files[i]);
    }
  });

  CodeMirror.on(cm.display.lineDiv, "dragleave", (ev) => {
    ev.preventDefault();
    if (getClass(ev.target, "CodeMirror-line")) removeClass(ev.target, "line-dragenter");
  });
}
