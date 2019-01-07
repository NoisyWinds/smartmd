import {menuList} from "../services/menu";
import {addClass, fixShortcut, inArray, isUrl, removeClass} from "../services/utils";
import shortcuts from "../config/shortcuts";
import getState from "../services/codemirror/getState";

function buildTooltips(title, actionName) {
  let tooltips = title;
  let action = menuList[actionName];

  if (typeof action === "function") {
    if (shortcuts[actionName]) {
      tooltips += ` (${fixShortcut(shortcuts[actionName])})`
    }
  }
  return tooltips;
}

function buildIcon(options) {
  let icon = document.createElement("a");

  if (options.title) icon.title = buildTooltips(options.title, options.action);
  icon.tabIndex = -1;
  icon.className = options.className;

  return icon
}

function buildItem(editor, name) {
  let options = editor.options;
  let toolbarConfig = options.toolbarConfig;
  let item = toolbarConfig[name];
  if (!item) return false;

  if (/split-line-[0-9]+/.test(name)) {
    let line = document.createElement("i");
    line.className = item.className;
    return line;
  }

  let icon = buildIcon(item);
  let action = menuList[item.action];
  if (typeof action === "function") {
    icon.onclick = (e) => {
      e.preventDefault();
      Reflect.apply(action, editor, []);
    }
  } else if (isUrl(item.action)) {
    icon.href = item.action;
    icon.target = "_blank";
  }

  return icon;
}

export default function (editor) {
  let bar = document.createElement("div");
  let toolbarElements = [];
  let cm = editor.codemirror;
  let options = editor.options;
  let cmElement = cm.getWrapperElement();
  let toolbarConfig = options.toolbarConfig;
  // set toolbar option
  let toolbar = options.toolbar;
  let hideToolbar = options.hideToolbar;

  bar.className = "smartmd__toolbar";

  function build(name) {
    let icon = buildItem(editor, name);
    if (!icon) return;
    if (inArray(name, hideToolbar)) icon.style.display = "none";
    toolbarElements[name] = icon;
    bar.appendChild(icon);
  }

  if (Array.isArray(toolbar)) {
    for (let i = 0; i < toolbar.length; i++) {
      let name = toolbar[i];
      if (name === "|") name = "split-line";
      build(name);
    }
  } else {
    for (let name in toolbarConfig) {
      if (toolbarConfig.hasOwnProperty(name)) build(name)
    }
  }


  cm.on("cursorActivity", () => {
    let stat = getState(cm);
    Object.keys(bar).forEach((key) => {
      let item = bar[key];
      if (stat[key]) {
        addClass(item, "active");
      } else {
        removeClass(item, "active");
      }
    })
  });

  cmElement.parentNode.insertBefore(bar, cmElement);
  editor.gui.toolbar = bar;
  editor.gui.toolbarElements = toolbarElements;
}
