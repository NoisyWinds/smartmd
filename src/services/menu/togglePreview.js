import {addClass, removeClass} from '../utils';
import {isFullScreen} from "./toggleFullScreen";

export let isPreviewActive = false;

function startPreview() {
  const cm = this.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = this.gui.preview;
  addClass(preview, "smartmd__preview--active");
  addClass(cmElement, "CodeMirror-sided");
  preview.innerHTML = this.markdown.render(this.value());
  cm.on('update', cm.renderPreviewFn);
}

function removePreview() {
  const cm = this.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = this.gui.preview;
  removeClass(preview, "smartmd__preview--active");
  removeClass(cmElement, "CodeMirror-sided");
  cm.off('update', cm.renderPreviewFn);
}

export default function togglePreview() {
  const toolbar = this.gui.toolbar;
  const cm = this.codemirror;
  const preview = this.gui.preview;
  let icon = false;

  if (!cm.renderPreviewFn) {
    cm.renderPreviewFn = () => {
      preview.innerHTML = this.markdown.render(this.value());
    };
  }

  if (toolbar) icon = this.gui.toolbarElements.preview;

  if (isPreviewActive) {
    removePreview.apply(this);
    if (icon) removeClass(icon, "active");
    isPreviewActive = false;
  } else {
    startPreview.apply(this);
    if (icon) addClass(icon, "active");
    isPreviewActive = true;
  }

  if (isFullScreen) {
    addClass(preview, "smartmd__preview--full");
    preview.style.height = "auto";
  } else {
    removeClass(preview, "smartmd__preview--full");
    preview.style.height = this.options.height;
  }

  cm.refresh();
}
