export default function (cm, pos) {
  pos = pos || cm.getCursor("start");
  let stat = cm.getTokenAt(pos);
  if (!stat.type) return {};

  let types = stat.type.split(" ");

  let ret = {}, data, text;

  for (let i = 0; i < types.length; i++) {
    data = types[i];
    switch (data) {
      case "strong":
        ret.bold = true;
        break;
      case "variable-2":
        text = cm.getLine(pos.line);
        if (/^\s*\d+\.\s/.test(text)) {
          ret["ordered-list"] = true;
        } else {
          ret["unordered-list"] = true;
        }
        break;
      case "atom":
        ret.quote = true;
        break;
      case "em":
        ret.italic = true;
        break;
      case "quote":
        ret.quote = true;
        break;
      case "strikethrough":
        ret.strikethrough = true;
        break;
      case "comment":
        ret.code = true;
        break;
      case "link":
        ret.link = true;
        break;
      case "tag":
        ret.image = true;
        break;
      default:
        if (data.match(/^header(-[1-6])?$/)) {
          ret[data.replace("header", "heading")] = true;
        }
    }
  }
  return ret;
}
