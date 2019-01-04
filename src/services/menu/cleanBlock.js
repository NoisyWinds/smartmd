export default function () {
  let cm = this.codemirror;
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  let text;

  for (let line = startPoint.line; line <= endPoint.line; line++) {
    text = cm.getLine(line);
    text = text.replace(/^[ ]*([# ]+|\*|-|[> ]+|[0-9]+(.|\)))[ ]*/, "");

    cm.replaceRange(text, {
      line: line,
      ch: 0
    }, {
      line: line,
      ch: 99999999999999
    });
  }
}
