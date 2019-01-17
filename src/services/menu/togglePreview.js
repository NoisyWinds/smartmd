import {addClass, removeClass} from '../utils';
import {isFullScreen} from "./toggleFullScreen";

export let isPreviewActive = false;
let isInit = false;

function startPreview() {
  const cm = this.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = this.gui.preview;
  const previewBody = this.gui.previewBody;

  addClass(preview, "smartmd__preview--active");
  addClass(cmElement, "CodeMirror-sided");
  previewBody.innerHTML = this.markdownIt.render(this.value());
  cm.on('change', cm.renderPreviewFn);
  cm.on('update', cm.updateScrollbar);
}

function removePreview() {
  const cm = this.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = this.gui.preview;

  removeClass(preview, "smartmd__preview--active");
  removeClass(cmElement, "CodeMirror-sided");
  cm.off('change', cm.renderPreviewFn);
  cm.off('update', cm.updateScrollbar);
}

function initPreview() {
  const cm = this.codemirror;
  const previewScrollbar = this.gui.previewScrollbar;
  const previewContent = this.gui.previewContent;
  const previewBody = this.gui.previewBody;
  let cmScroll, pScroll, originScroll = false;

  // codeMirror editor scroll
  cm.on("scroll", function (v) {
    if (cmScroll) {
      cmScroll = false;
      return;
    }
    pScroll = true;
    originScroll = true;
    const height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
    const ratio = parseFloat(v.getScrollInfo().top) / height;
    const top = (previewScrollbar.scrollHeight - previewScrollbar.clientHeight) * ratio;
    previewScrollbar.scrollTop = top;
    previewContent.scrollTop = top;
  });

  // preview scrollbar scroll
  previewScrollbar.onscroll = function () {
    if (pScroll) {
      pScroll = false;
      return;
    }
    cmScroll = true;
    originScroll = true;
    const height = this.scrollHeight - this.clientHeight;
    const ratio = parseFloat(this.scrollTop) / height;
    const move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
    previewContent.scrollTop = this.scrollTop;
    cm.scrollTo(0, move);
  };

  previewContent.onscroll = function () {
    if (originScroll) {
      originScroll = false;
      return;
    }
    pScroll = true;
    cmScroll = true;
    const height = this.scrollHeight - this.clientHeight;
    const ratio = parseFloat(this.scrollTop) / height;
    const move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
    previewScrollbar.scrollTop = this.scrollTop;
    cm.scrollTo(0, move);
  };

  cm.renderPreviewFn = () => {
    previewBody.innerHTML = this.markdownIt.render(this.value());
  };

  cm.updateScrollbar = () => {
    let scrollHeight = previewContent.scrollHeight - 35;
    const offsetHeight = previewContent.offsetHeight - 35;
    if (scrollHeight <= offsetHeight) {
      scrollHeight = offsetHeight
    }
    previewScrollbar.firstElementChild.style.height = `${scrollHeight}px`;
  };

  isInit = true;
}

export default function togglePreview() {
  const toolbar = this.gui.toolbar;
  const cm = this.codemirror;
  const preview = this.gui.preview;
  let icon = false;

  if (!isInit) initPreview.apply(this);
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
  } else {
    removeClass(preview, "smartmd__preview--full");
  }

  cm.refresh();
}
