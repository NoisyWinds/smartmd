import {addClass, removeClass} from "../utils";

export default function (content, delay, theme) {
  let wrapper = this.gui.alert;
  theme = this.options.alert.theme[theme] || this.options.alert.theme.success;

  let block = document.createElement("div");
  let button = document.createElement("button");
  button.className = "fa fa-close";
  block.className = `smartmd__alert__item ${theme.className}`;
  block.innerHTML = `<i class='${theme.icon}'></i>${content}`;
  block.appendChild(button);
  wrapper.appendChild(block);

  setTimeout(() => {
    addClass(block, "smartmd__alert__item--fadeIn")
  }, 0);

  let p = new Promise((resolve) => {
    button.onclick = function () {
      resolve();
    };
    if (delay) {
      setTimeout(() => {
        resolve()
      }, delay)
    }
  });

  p.then(() => {
    removeClass(block, "smartmd__alert__item--fadeIn");
    setTimeout(() => {
      block.remove()
    }, 500);
  })

}
