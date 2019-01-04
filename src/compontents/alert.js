export default function (editor) {
  let alert = document.createElement("div");
  let cmElement = editor.codemirror.getWrapperElement();

  alert.className = "smartmd__alert";
  cmElement.parentNode.append(alert);

  return alert;
}

