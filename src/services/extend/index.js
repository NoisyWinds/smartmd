import uploadImages from "./uploadImages"
import alert from "./alert"
import {def} from "../utils";
import {autoSaveUpdate, clearAutoSaved, clearAutoSavedValue, startAutoSave} from "./autoSave";


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


function resize(width, height) {
  let gui = this.gui;
  if (width) {
    width = isNaN(width) ? width : `${width}px`;
    gui.wrapper.style.width = width;
  }
  if (height) {
    const toolbarHeight = gui.toolbar.offsetHeight;
    const statusbarHeight = gui.statusbar.offsetHeight;
    height = parseInt(height, 10);
    gui.wrapper.style.height = `${height}px`;
    height = height - toolbarHeight - statusbarHeight;
    this.codemirror.setSize(null, `${height}px`)
  }
}


export const ext = {
  toTextArea,
  alert,
  uploadImages,
  autoSaveUpdate,
  clearAutoSaved,
  clearAutoSavedValue,
  startAutoSave,
  resize
};

export default function (editor) {
  for (let name in ext) {
    if (ext.hasOwnProperty(name)) {
      def(editor, name, ext[name])
    }
  }
}
