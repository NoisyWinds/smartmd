import {addClass, removeClass, toggleClass} from '../utils';

export let isFullScreen = false;

export default function () {
  const cm = this.codemirror;
  const toolbar = this.gui.toolbar;
  const preview = this.gui.preview;

  cm.setOption('fullScreen', !cm.getOption('fullScreen'));
  toggleClass(document.body, "body-hidden");

  if (toolbar) {
    const button = this.gui.toolbarElements.fullscreen;
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
