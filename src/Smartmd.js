import CodeMirror from "./services/codemirror"
import defaults from "./config"
import MarkdownIt from "./services/markdown-it"
import initGui from "./compontents/main"
import * as utils from "./services/utils"
import initMenu from "./services/menu"
import initExtend from "./services/extend"
import Observer from "./services/observer";
import initState from "./services/state"

export class Smartmd {
  constructor(options) {

    let opt = utils.extend({}, defaults, options);

    // find textArea element
    if (!opt.el) {
      // no element was found
      console.error("Smartmd: Error. No element was found.");
      return
    }
    new Observer(opt);
    this.options = opt;
    this.options.parent = this;
    this.utils = utils;

    // write function under class Smartmd
    initMenu(this);
    initExtend(this);
    this.markdown = MarkdownIt(this);
    this.codemirror = CodeMirror(this);
    initGui(this);
    initState(this);
  }

  value(text) {
    if (text === undefined) {
      return this.codemirror.getValue();
    }
    this.codemirror.setValue(text);
    return this;
  }

  set(options) {
    if (utils.isObject(options)) utils.assign(this.options, options)
  }

  getOption(option) {
    return this.options[option];
  }
}




