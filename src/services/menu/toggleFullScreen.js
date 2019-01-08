import {addClass, removeClass, toggleClass} from "../utils";

export let isFullScreen = false;

export default function () {
  let cm = this.codemirror;
  let toolbar = this.gui.toolbar;
  let preview = this.gui.preview;

  cm.setOption("fullScreen", !cm.getOption("fullScreen"));
  toggleClass(document.body, "body-hidden");

  if (toolbar) {
    let button = this.gui.toolbarElements.fullscreen;
    toggleClass(toolbar, "smartmd__toolbar--full");
    if (button) toggleClass(button, "active");
  }

  if (isFullScreen) {
    removeClass(preview, "smartmd__preview--full");
    isFullScreen = false;
  } else {
    addClass(preview, "smartmd__preview--full");
    isFullScreen = true;
  }
}
