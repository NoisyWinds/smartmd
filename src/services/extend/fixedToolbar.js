import {addClass, removeClass} from "../utils";

let isFixed,
  toolbarTop,
  toolbar = false;

export function clearFixed() {
  removeClass(toolbar, "smartmd__toolbar--fixed");
  window.removeEventListener("scroll", checkHeight);
}

function checkHeight() {
  let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (scrollTop >= toolbarTop) {
    if (isFixed) return;
    isFixed = true;
    addClass(toolbar, "smartmd__toolbar--fixed")
  } else {
    isFixed = false;
    removeClass(toolbar, "smartmd__toolbar--fixed")
  }
}

export function initFixedToolbar() {
  toolbar = this.gui.toolbar;
  let ele = toolbar;
  toolbarTop = toolbar.offsetTop;
  while (ele.offsetParent) {
    ele = ele.offsetParent;
    toolbarTop += ele.offsetTop;
  }
  window.addEventListener("scroll", checkHeight)
}

