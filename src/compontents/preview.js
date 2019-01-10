import {assign} from "../services/utils";

export default function (editor) {
  const cm = editor.codemirror;
  const cmElement = cm.getWrapperElement();
  const preview = document.createElement("div");
  const previewScrollbar = document.createElement("div");
  const scrollbarChild = document.createElement("div");
  const previewContent = document.createElement("div");
  const previewBody = document.createElement("div");

  preview.className = "smartmd__preview ";
  previewScrollbar.className = "smartmd__preview__scrollbar";
  previewContent.className = "smartmd__preview__content";
  previewBody.className = "markdown-body";
  scrollbarChild.style.minWidth = "1px";

  previewScrollbar.appendChild(scrollbarChild);
  preview.appendChild(previewScrollbar);
  previewContent.appendChild(previewBody);
  preview.appendChild(previewContent);
  cmElement.parentNode.append(preview);

  assign(editor.gui, {
    preview,
    previewScrollbar,
    previewBody,
    previewContent
  })
}
