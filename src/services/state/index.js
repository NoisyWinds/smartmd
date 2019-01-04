import Watcher from "../observer/Watcher";
import {clearFixed, initFixedToolbar} from "../extend/fixedToolbar";
import {clearAutoSaved, initAutoSave} from "../extend/autoSave";
import {isObject} from "../utils";

function isFixedToolbar(val) {
  val ? Reflect.apply(initFixedToolbar, this.parent, []) : clearFixed()
}

function autoSave(val) {
  isObject(val) ? Reflect.apply(initAutoSave, this.parent, []) : clearAutoSaved()
}

const watchers = {
  isFixedToolbar,
  autoSave
};

export default function (editor) {
  const options = editor.options;
  if (options.isFixedToolbar) Reflect.apply(initFixedToolbar, editor, []);
  if (isObject(options.autoSave)) Reflect.apply(initAutoSave, editor, []);
  for (let name in watchers) {
    if (watchers.hasOwnProperty(name)) {
      new Watcher(editor.options, name, watchers[name])
    }
  }
}
