import Watcher from "../observer/Watcher";
import {clearFixed, startFixedToolbar} from "../extend/fixedToolbar";
import {clearAutoSaved, startAutoSave} from "../extend/autoSave";
import {isObject} from "../utils";

function isFixedToolbar(val) {
  val ? startFixedToolbar.apply(this) : clearFixed()
}

function autoSave(val) {
  isObject(val) ? startAutoSave.apply(this) : clearAutoSaved()
}

function isRenderActive() {
  this.toggleRender()
}

function isFullScreen() {
  this.toggleFullScreen()
}

function isPreviewActive() {
  this.togglePreview()
}

function height(val) {
  this.resize(null, val)
}

function width(val) {
  this.resize(val, null)
}

const watchers = {
  isFixedToolbar,
  autoSave,
  isRenderActive,
  isFullScreen,
  isPreviewActive,
  height,
  width
};

export default function (editor) {
  const options = editor.options;

  // init editor state with options
  if (options.isFixedToolbar) startFixedToolbar.apply(editor);
  if (isObject(options.autoSave)) startAutoSave.apply(editor);
  if (options.isFullScreen) editor.toggleFullScreen();
  if (options.isPreviewActive) editor.togglePreview();
  if (options.width) editor.resize(options.width, null);
  if (options.height) editor.resize(null, options.height);

  let wClass = [];
  // watch options change
  for (let name in watchers) {
    if (watchers.hasOwnProperty(name)) {
      let watch = new Watcher(options, name, watchers[name].bind(editor));
      wClass.push(watch);
    }
  }

  return wClass;
}
