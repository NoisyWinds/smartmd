import getState from "../codemirror/getState";

export default function (editor, type, start_chars, end_chars) {
  let cm = editor.codemirror;
  let stat = getState(cm);
  let text;
  let start = start_chars;
  let end = (typeof end_chars === "undefined") ? start_chars : end_chars;
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  if (stat[type]) {
    text = cm.getLine(startPoint.line);
    start = text.slice(0, startPoint.ch);
    end = text.slice(startPoint.ch);

    switch (type) {
      case "bold":
        start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, "");
        end = end.replace(/(\*\*|__)/, "");
        break;
      case "italic":
        start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, "");
        end = end.replace(/(\*|_)/, "");
        break;
      case "strikethrough":
        start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, "");
        end = end.replace(/(\*\*|~~)/, "");
        break;
      default:
        break;
    }

    cm.replaceRange(start + end, {
      line: startPoint.line,
      ch: 0
    }, {
      line: startPoint.line,
      ch: 99999999999999
    });

    // two code
    if (type === "bold" || type === "strikethrough") {
      startPoint.ch -= 2;
      if (startPoint !== endPoint) {
        endPoint.ch -= 2;
      }
    } else if (type === "italic") {
      startPoint.ch -= 1;
      if (startPoint !== endPoint) {
        endPoint.ch -= 1;
      }
    }
  } else {
    text = cm.getSelection();
    switch (type) {
      case "bold":
        text = text.split("**").join("");
        text = text.split("__").join("");
        break;
      case "italic":
        text = text.split("*").join("");
        text = text.split("_").join("");
        break;
      case "strikethrough":
        text = text.split("~~").join("");
        break;
      default:
        break;
    }
    cm.replaceSelection(start + text + end);

    startPoint.ch += start_chars.length;
    endPoint.ch = startPoint.ch + text.length;
  }

  cm.setSelection(startPoint, endPoint);
  cm.focus();
}
