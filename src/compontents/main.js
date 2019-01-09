import buildPreview from "./preview"
import buildToolbar from "./toolbar"
import buildRender from "./render"
import buildStatusbar from "./statusbar"
import buildAlert from "./alert"

export default function (editor) {
  const options = editor.options;
  const wrapper = document.createElement("div");
  const cm = editor.codemirror;
  const cmElement = cm.getWrapperElement();

  wrapper.className = "smartmd";
  cmElement.parentNode.replaceChild(wrapper, cmElement);
  options.el.parentNode.replaceChild(wrapper, options.el);
  wrapper.appendChild(cmElement);
  wrapper.appendChild(options.el);

  editor.gui = {};
  editor.gui.wrapper = wrapper;

  buildPreview(editor);
  buildAlert(editor);
  buildRender(editor);
  buildToolbar(editor);
  buildStatusbar(editor);
}
