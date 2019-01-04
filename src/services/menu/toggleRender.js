import {addClass, getClass, removeClass} from "../utils"

export default function () {
  let toolbar = this.gui.toolbar;
  let render = this.gui.render;

  if (getClass(render, "smartmd__render--active")) {
    removeClass(render, "smartmd__render--active");

    if (toolbar) {
      let button = this.gui.toolbarElements.render;
      if (button) removeClass(button, "active");
      removeClass(toolbar, "smartmd__toolbar--disabled");
    }

    setTimeout(() => {
      render.style.display = "none";
    }, 150)
  } else {
    let renderBody = this.gui.renderBody;

    if (toolbar) {
      let button = this.gui.toolbarElements.render;
      addClass(toolbar, "smartmd__toolbar--disabled");
      addClass(button, "active");
    }

    renderBody.innerHTML = this.markdown.render(this.value());
    render.style.display = "block";

    setTimeout(() => {
      addClass(render, "smartmd__render--active")
    }, 0)
  }
}
