import CodeMirror from "codemirror"
import "./tablist"
import "./markdown"
import shortcuts from "../../config/shortcuts"
import {menuList} from "../menu"
import "codemirror/addon/display/fullscreen"
import "codemirror/addon/mode/overlay"
import "codemirror/addon/edit/closetag"
import "codemirror/addon/edit/matchtags"
import "codemirror/addon/edit/continuelist"
import "codemirror/addon/display/placeholder"
import "codemirror/addon/selection/mark-selection"
import "codemirror/mode/markdown/markdown"
import draggable from "./draggable";

export default function (editor) {
  let options = editor.options;

  Object.keys(shortcuts).forEach((name) => {
    let key = shortcuts[name];
    if (menuList[name]) {
      options.CodeMirrorConfig.extraKeys[key] = () => Reflect.apply(menuList[name], editor, []);
    }
  });

  let placeholder = options.el.getAttribute("placeholder");
  if (placeholder) options.CodeMirrorConfig.placeholder = placeholder;

  const cm = CodeMirror.fromTextArea(options.el, options.CodeMirrorConfig);
  draggable(editor, cm);
  return cm;
}

