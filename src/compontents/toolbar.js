import {menuList} from "../services/menu";
import {addClass, assign, fixShortcut, inArray, isUrl, removeClass} from "../services/utils";
import shortcuts from "../config/shortcuts";
import getState from "../services/codemirror/getState";

function buildTooltips(title, actionName) {
  const action = menuList[actionName];
  let tooltips = title;

  if (typeof action === "function") {
    if (shortcuts[actionName]) {
      tooltips += ` (${fixShortcut(shortcuts[actionName])})`
    }
  }
  return tooltips;
}

function buildIcon(options) {
  const icon = document.createElement("a");

  if (options.title) icon.title = buildTooltips(options.title, options.action);
  icon.tabIndex = -1;
  icon.className = options.className;

  return icon
}

function buildItem(editor, name) {
  const options = editor.options;
  const toolbarConfig = options.toolbarConfig;
  const item = toolbarConfig[name];
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
  const toolbar = document.createElement("div");
  const toolbarElements = [];
  const cm = editor.codemirror;
  const options = editor.options;
  const cmElement = cm.getWrapperElement();
  const toolbarConfig = options.toolbarConfig;
  // set toolbar option
  const toolbarOptions = options.toolbar;
  const hideToolbar = options.hideToolbar;

  toolbar.className = "smartmd__toolbar";

  function build(name) {
    let icon = buildItem(editor, name);
    if (!icon) return;
    if (inArray(name, hideToolbar)) icon.style.display = "none";
    toolbarElements[name] = icon;
    toolbar.appendChild(icon);
  }

  if (Array.isArray(toolbarOptions)) {
    for (let i = 0; i < toolbarOptions.length; i++) {
      let name = toolbarOptions[i];
      if (name === "|") name = "split-line";
      build(name);
    }
  } else {
    for (let name in toolbarConfig) {
      if (toolbarConfig.hasOwnProperty(name)) build(name)
    }
  }


  cm.on("cursorActivity", () => {
    const stat = getState(cm);
    Object.keys(toolbar).forEach((key) => {
      const item = toolbar[key];
      if (stat[key]) {
        addClass(item, "active");
      } else {
        removeClass(item, "active");
      }
    })
  });

  cmElement.parentNode.insertBefore(toolbar, cmElement);

  assign(editor.gui, {
    toolbar,
    toolbarElements
  })
}
