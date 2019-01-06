import Watcher from "../observer/Watcher";
import {clearFixed, initFixedToolbar} from "../extend/fixedToolbar";
import {clearAutoSaved, initAutoSave} from "../extend/autoSave";
import {isObject} from "../utils";
import togglePreview from "../menu/togglePreview";

function isFixedToolbar(val) {
  val ? Reflect.apply(initFixedToolbar, this.parent, []) : clearFixed()
}

function autoSave(val) {
  isObject(val) ? Reflect.apply(initAutoSave, this.parent, []) : clearAutoSaved()
}

function preview() {
  Reflect.apply(togglePreview, this.parent, [])
}

const watchers = {
  isFixedToolbar,
  autoSave,
  preview
};

export default function (editor) {
  const options = editor.options;
  if (options.isFixedToolbar) Reflect.apply(initFixedToolbar, editor, []);
  if (isObject(options.autoSave)) Reflect.apply(initAutoSave, editor, []);
  if (options.preview !== false) Reflect.apply(togglePreview, editor, []);
  for (let name in watchers) {
    if (watchers.hasOwnProperty(name)) {
      new Watcher(editor.options, name, watchers[name])
    }
  }
}
