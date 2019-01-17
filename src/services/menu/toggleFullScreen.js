import {addClass, removeClass, toggleClass} from '../utils';
import {isPreviewActive} from "./togglePreview";

export let isFullScreen = false;

export default function () {
  const cm = this.codemirror;
  const toolbar = this.gui.toolbar;
  const preview = this.gui.preview;

  if (isFullScreen) {
    cm.setOption('fullScreen', false);
    removeClass(document.body, "body-hidden");
    if (isPreviewActive) removeClass(preview, "smartmd__preview--full");
    isFullScreen = false;
  } else {
    cm.setOption('fullScreen', true);
    if (isPreviewActive) addClass(preview, "smartmd__preview--full");
    isFullScreen = true;
  }

  if (toolbar) {
    const button = this.gui.toolbarElements.fullscreen;
    toggleClass(toolbar, "smartmd__toolbar--full");
    if (button) toggleClass(button, "active");
  }
}
