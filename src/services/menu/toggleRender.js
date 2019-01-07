import {addClass, removeClass} from "../utils"

export let isRenderActive = false;

export default function () {
  const toolbar = this.gui.toolbar;
  const render = this.gui.render;

  if (isRenderActive) {
    removeClass(render, "smartmd__render--active");
    setTimeout(() => {
      render.style.display = "none";
      isRenderActive = false;

      if (!toolbar) return;
      const button = this.gui.toolbarElements.render;
      // toggleRender button maybe hidden
      if (button) removeClass(button, "active");
      removeClass(toolbar, "smartmd__toolbar--disabled");
    }, 150)
  } else {
    const renderBody = this.gui.renderBody;

    if (toolbar) {
      const button = this.gui.toolbarElements.render;
      if (button) addClass(button, "active");
      addClass(toolbar, "smartmd__toolbar--disabled");
    }

    renderBody.innerHTML = this.markdown.render(this.value());
    render.style.display = "block";
    isRenderActive = true;

    // set renderBody enter animation
    setTimeout(() => {
      addClass(render, "smartmd__render--active")
    }, 0)
  }
}
