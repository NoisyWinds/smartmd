import {isLocalStorage, isObject} from "../utils";

let loaded,
  interval,
  autoSaveOptions,
  delay,
  el,
  uuid = false;

function getOptions() {
  if (isObject(autoSaveOptions) && isLocalStorage()) {
    if (!autoSaveOptions.uuid) {
      console.warn("Smartmd: You must set a uuid to autoSaved");
      return false;
    }
    return true
  }
  return false;
}

function update(editor) {
  let d = new Date();
  let h = d.getHours();
  let m = d.getMinutes();
  let s = d.getSeconds();
  m = m < 10 ? "0" + m : m;
  h = h < 10 ? "0" + h : h;
  s = s < 10 ? "0" + s : s;
  el.innerHTML = `auto saved at: ${h}:${m}:${s}`;
  localStorage.setItem(uuid, editor.value());
}

export function clearAutoSaved() {
  if (!interval) return;
  clearInterval(interval);
  interval = false;
  el.innerHTML = "auto save stopped";
}

export function clearAutoSavedValue() {
  if (uuid) localStorage.removeItem(uuid);
}

export function autoSaveUpdate() {
  if (loaded) update(this)
}

export function startAutoSave() {
  if (!interval) {
    interval = setInterval(() => update(this), delay)
  }
}

export function initAutoSave() {
  autoSaveOptions = this.options.autoSave;
  el = this.options.autoSaveElement;
  if (!getOptions()) return;
  uuid = autoSaveOptions.uuid;
  delay = autoSaveOptions.delay || 5000;

  let text = localStorage.getItem(uuid);
  if (text) {
    this.codemirror.setValue(text)
  }

  loaded = true;

  // restart autoSave need clear interval
  clearAutoSaved();
  Reflect.apply(startAutoSave, this, []);
}
