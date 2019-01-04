import {addClass, getClass, removeClass, toggleClass} from "../utils";

export default function () {
  let cm = this.codemirror;
  let cmElement = cm.getWrapperElement();
  let preview = this.gui.preview;
  let toolbar = this.gui.toolbar;
  let usePreviewRender = false;

  toggleClass(preview, "smartmd__preview--active");
  toggleClass(cmElement, "CodeMirror-sided");

  if (cm.getOption("fullScreen")) {
    addClass(preview, "smartmd__preview--full");
    preview.style.height = "auto";
  } else {
    removeClass(preview, "smartmd__preview--full");
    preview.style.height = this.options.height;
  }

  if (toolbar) {
    let button = this.gui.toolbarElements.preview;
    toggleClass(button, "active");
  }

  if (getClass(preview, "smartmd__preview--active")) {
    usePreviewRender = true;
  }

  let previewRender = function () {
    preview.innerHTML = this.markdown.render(this.value());
  }.bind(this);

  if (!cm.previewRender) {
    cm.previewRender = previewRender;
  }

  if (usePreviewRender) {
    preview.innerHTML = this.markdown.render(this.value());
    cm.on("update", cm.previewRender);
  } else {
    cm.off("update", cm.previewRender);
  }

  cm.refresh();
}
