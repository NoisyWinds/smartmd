import {assign, isObject} from "../services/utils";

function wordCount(data) {
  let pattern = /[a-zA-Z0-9_\u0392-\u03c9\u0410-\u04F9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
  let m = data.match(pattern);
  let count = 0;
  if (m === null) return count;
  for (let i = 0; i < m.length; i++) {
    if (m[i].charCodeAt(0) >= 0x4E00) {
      count += m[i].length;
    } else {
      count += 1;
    }
  }
  return count;
}

const defaultStatus = {
  "words": {
    defaultValue: "0",
    onUpdate(el) {
      el.innerHTML = wordCount(this.codemirror.getValue());
    }
  },
  "lines": {
    defaultValue: "0",
    onUpdate(el) {
      el.innerHTML = this.codemirror.lineCount();
    }
  },
  "cursor": {
    defaultValue: "0:0",
    onUpdate(el) {
      let pos = this.codemirror.getCursor();
      el.innerHTML = pos.line + ":" + pos.ch;
    }
  },
  "autoSave": {
    defaultValue(el) {
      el.innerHTML = "wait auto saving...";
      this.options.autoSaveElement = el;
    }
  },
  "block": {
    defaultValue: "noType",
    onUpdate(el) {
      let pos = this.codemirror.getCursor();
      el.innerHTML = this.codemirror.getTokenTypeAt(pos) || "noType"
    }
  }
};

export default function (editor) {
  let options = editor.options;
  let statusbarElements = [];
  const status = options.statusbar;
  const statusbar = document.createElement("div");
  const cm = editor.codemirror;
  const cmElement = cm.getWrapperElement();

  statusbar.className = "smartmd__statusbar";

  if (Array.isArray(status)) {
    status.forEach((item) => {
      let el = document.createElement("span");
      let obj = defaultStatus[item];
      if (!isObject(obj)) return;
      el.className = obj.className || `smartmd__statusbar__${item}`;

      if (typeof obj.onUpdate === "function") {
        cm.on("update", () => {
          obj.onUpdate.apply(editor, [el]);
        });
      }

      if (typeof obj.defaultValue === "function") {
        obj.defaultValue.apply(editor, [el])
      } else if (typeof obj.defaultValue === "string") {
        el.innerHTML = obj.defaultValue;
      }

      // append the item to the status bar
      statusbar.appendChild(el);
      statusbarElements[item] = el;
    })
  }

  cmElement.parentNode.appendChild(statusbar);

  assign(editor.gui, {
    statusbar,
    statusbarElements
  })
}
