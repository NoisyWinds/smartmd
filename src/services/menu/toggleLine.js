import getState from "../codemirror/getState";

export default function (cm, name) {
  let stat = getState(cm);
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  let repl = {
    "quote": /^(\s*)>\s+/,
    "unordered-list": /^(\s*)(\*|-|\+)\s+/,
    "ordered-list": /^(\s*)\d+\.\s+/
  };
  let map = {
    "quote": "> ",
    "unordered-list": "* ",
    "ordered-list": "1. "
  };
  for (let i = startPoint.line; i <= endPoint.line; i++) {
    let text = cm.getLine(i);
    if (stat[name]) {
      text = text.replace(repl[name], "$1");
    } else {
      text = map[name] + text;
    }
    cm.replaceRange(text, {
      line: i,
      ch: 0
    }, {
      line: i,
      ch: 99999999999999
    });
  }
  cm.focus();
}
