export default function (editor) {
  let cmElement = editor.codemirror.getWrapperElement();
  let render = document.createElement("div");
  let container = document.createElement("div");
  let closeButton = document.createElement("button");
  let body = document.createElement("div");

  render.className = "smartmd__render";
  container.className = "smartmd__render__container";
  closeButton.className = "smartmd__render__closeButton fa fa-close";
  body.className = "markdown-body smartmd__render__body";

  container.appendChild(closeButton);
  container.appendChild(body);
  render.appendChild(container);
  cmElement.parentNode.append(render);

  // closeButton click function
  closeButton.onclick = () => {
    editor.toggleRender();
  };

  editor.gui.render = render;
  editor.gui.renderBody = body;
}
