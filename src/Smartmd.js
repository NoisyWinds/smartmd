import CodeMirror from "./services/codemirror"
import defaults from "./config"
import MarkdownIt from "./services/markdown-it"
import initGui from "./compontents/main"
import * as utils from "./services/utils"
import initMenu from "./services/menu"
import initExtends from "./services/extend"
import Observer from "./services/observer";
import initState from "./services/state"

export class Smartmd {
  constructor(options) {

    let opt = utils.extend({}, defaults, options);

    // find textArea element
    if (opt.el) {
      opt.el = utils.getElement(opt.el);
      console.log(opt.el);
    } else {
      // no element found
      console.error("Smartmd: Error. No element was found.");
      return
    }

    new Observer(opt);
    this.options = opt;
    this.utils = utils;
    this.markdownIt = MarkdownIt(this);
    this.codemirror = CodeMirror(this);

    // toolbar list active function
    initMenu(this);
    // Smartmd Class extend function
    initExtends(this);

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

  get(option) {
    return this.options[option];
  }
}




