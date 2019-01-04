import buildPreview from "./preview"
import buildToolbar from "./toolbar"
import buildRender from "./render"
import buildStatusbar from "./statusbar"
import buildAlert from "./alert"

export default function (editor) {
  let options = editor.options;
  let wrapper = document.createElement("div");
  let cm = editor.codemirror;
  let cmElement = cm.getWrapperElement();
  editor.gui = {};

  wrapper.className = "smartmd";
  cmElement.parentNode.replaceChild(wrapper, cmElement);
  options.el.parentNode.replaceChild(wrapper, options.el);
  wrapper.appendChild(cmElement);
  wrapper.appendChild(options.el);
  editor.gui.wrapper = wrapper;
  console.log(editor);

  buildPreview(editor);
  buildAlert(editor);
  buildRender(editor);
  buildToolbar(editor);
  buildStatusbar(editor);
}
