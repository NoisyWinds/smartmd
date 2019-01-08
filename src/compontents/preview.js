export default function (editor) {
  const cm = editor.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = document.createElement("div");
  const scrollbar = document.createElement("div");
  const scrollbarChild = document.createElement("div");
  const content = document.createElement("div");

  preview.className = "smartmd__preview ";
  scrollbar.className = "smartmd__preview__scrollbar";
  content.className = "smartmd__preview__content markdown-body";
  scrollbarChild.style.minWidth = "1px";

  scrollbar.appendChild(scrollbarChild);
  preview.appendChild(scrollbar);
  preview.appendChild(content);
  cmElement.parentNode.append(preview);
  editor.gui.preview = preview;
  editor.gui.previewScrollbar = scrollbar;
  editor.gui.previewContent = content;
}
