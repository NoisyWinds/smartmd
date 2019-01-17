export default function (editor) {
  const alert = document.createElement("div");
  const cmElement = editor.codemirror.getWrapperElement();

  alert.className = "smartmd__alert";
  cmElement.parentNode.appendChild(alert);

  editor.gui.alert = alert
}

