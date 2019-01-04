export default function (cm, direction, size) {
  let startPoint = cm.getCursor("start");
  let endPoint = cm.getCursor("end");
  for (let i = startPoint.line; i <= endPoint.line; i++) {
    let text = cm.getLine(i);
    // count how much # isset
    let currHeadingLevel = text.search(/[^#]/);
    if (direction === "bigger") {
      // less than 0 start over from 5
      switch (currHeadingLevel) {
        case 0:
          text = "###### " + text;
          break;
        case 1:
          text = text.substr(2);
          break;
        default:
          text = text.substr(1);
      }
    } else if (direction === "smaller") {
      // over 5 start over from 0
      switch (currHeadingLevel) {
        case 0:
          text = "# " + text;
          break;
        case 6:
          text = text.substr(7);
          break;
        default:
          text = "#" + text;
      }
    } else {
      // has direction
      switch (currHeadingLevel) {
        case 0:
          text = `${"#".repeat(size)} ${text}`;
          break;
        case size:
          text = text.substr(currHeadingLevel + 1);
          break;
        default:
          text = `${"#".repeat(size)} ${text.substr(currHeadingLevel + 1)}`;
      }
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
