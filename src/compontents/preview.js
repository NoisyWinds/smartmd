export default function (editor) {
  let cm = editor.codemirror;
  let cmElement = cm.getWrapperElement();
  let preview = document.createElement("div");
  let cScroll = false;
  let pScroll = false;

  preview.className = "smartmd__preview markdown-body";

  cm.on("scroll", (v) => {
    if (cScroll) {
      cScroll = false;
      return;
    }
    pScroll = true;
    let height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
    let ratio = parseFloat(v.getScrollInfo().top) / height;
    preview.scrollTop = (preview.scrollHeight - preview.clientHeight) * ratio;
  });

  preview.onscroll = () => {
    if (pScroll) {
      pScroll = false;
      return;
    }
    cScroll = true;
    let height = preview.scrollHeight - preview.clientHeight;
    let ratio = parseFloat(preview.scrollTop) / height;
    let move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
    cm.scrollTo(0, move);
  };

  cmElement.parentNode.append(preview);
  editor.gui.preview = preview;
}
