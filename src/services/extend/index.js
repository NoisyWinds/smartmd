import uploadImages from "./uploadImages"
import alert from "./alert"
import {def} from "../utils";
import {autoSaveUpdate, clearAutoSaved, clearAutoSavedValue, startAutoSave} from "./autoSave";


function toTextArea() {
  let gui = this.gui;
  let children = gui.wrapper.childNodes;
  this.codemirror.toTextArea();
  for (let i = 0; i < children.length; i++) {
    if (children[i].nodeName !== 'TEXTAREA') {
      children[i].remove();
    }
  }
}

function parsePixes(pixes) {
  return isNaN(pixes) ? pixes : `${pixes}px`;
}

function resize(width, height) {
  let gui = this.gui;
  if (width) gui.wrapper.style.width = parsePixes(width);
  if (height) gui.wrapper.style.height = parsePixes(height);
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
