import uploadImages from "./uploadImages"
import alert from "./alert"
import {def, getClass} from "../utils";
import {autoSaveUpdate, clearAutoSaved, clearAutoSavedValue, startAutoSave} from "./autoSave";

function isPreviewActive() {
  return getClass(this.gui.preview, "smartmd__preview--active")
}

function isRenderActive() {
  return getClass(this.gui.render, "smartmd__render--active")
}

function isFullScreen() {
  return this.codemirror.getOption("fullScreen");
}

function toTextArea() {
  let gui = this.gui;
  let wrapper = gui.wrapper;
  if (gui.alert) wrapper.removeChild(gui.alert);
  if (gui.preview) wrapper.removeChild(gui.preview);
  if (gui.render) wrapper.removeChild(gui.render);
  if (gui.toolbar) wrapper.removeChild(gui.toolbar);
  if (gui.statusbar) wrapper.removeChild(gui.statusbar);
  this.codemirror.toTextArea();
}

function setSize(width, height) {
  width = isNaN(width) ? width : `${width}px`;
  height = isNaN(height) ? height : `${height}px`;
  this.options.width = width;
  this.options.height = height;
}

export const ext = {
  isPreviewActive,
  isRenderActive,
  isFullScreen,
  toTextArea,
  alert,
  uploadImages,
  autoSaveUpdate,
  clearAutoSaved,
  clearAutoSavedValue,
  startAutoSave,
  setSize
};

export default function (editor) {
  for (let name in ext) {
    if (ext.hasOwnProperty(name)) {
      def(editor, name, ext[name])
    }
  }
}
