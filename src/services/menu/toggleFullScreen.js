import {addClass, getClass, removeClass, toggleClass} from "../utils";

export default function () {
  let cm = this.codemirror;
  let toolbar = this.gui.toolbar;
  let preview = this.gui.preview;

  cm.setOption("fullScreen", !cm.getOption("fullScreen"));
  toggleClass(document.body, "body-hidden");

  if (toolbar) {
    let button = this.gui.toolbarElements.fullscreen;
    toggleClass(toolbar, "smartmd__toolbar--full");
    toggleClass(button, "active");
  }
  if (getClass(preview, "smartmd__preview--full")) {
    removeClass(preview, "smartmd__preview--full");
    preview.style.height = this.options.height;
  } else {
    addClass(preview, "smartmd__preview--full");
    preview.style.height = "auto";
  }
}
