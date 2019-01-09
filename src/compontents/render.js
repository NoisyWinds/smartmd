import {assign} from "../services/utils";

export default function (editor) {
  const cmElement = editor.codemirror.getWrapperElement();
  const render = document.createElement("div");
  const container = document.createElement("div");
  const closeButton = document.createElement("button");
  const renderBody = document.createElement("div");

  render.className = "smartmd__render";
  container.className = "smartmd__render__container";
  closeButton.className = "smartmd__render__closeButton fa fa-close";
  renderBody.className = "markdown-body smartmd__render__body";

  container.appendChild(closeButton);
  container.appendChild(renderBody);
  render.appendChild(container);
  cmElement.parentNode.append(render);

  // closeButton click function
  closeButton.onclick = () => {
    editor.toggleRender();
  };

  assign(editor.gui, {
    render,
    renderBody
  })
}
