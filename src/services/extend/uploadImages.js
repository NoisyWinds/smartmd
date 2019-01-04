import {getToken} from "../utils";
import buildUploadWidget from "../../compontents/uploadwidget"

export function checkImage(file) {
  let options = this.options;
  let maxSize = options.uploads.maxSize;
  let type = options.uploads.type;
  let suffix = file.name.toLowerCase().split(".").splice(-1)[0];
  let delay = this.options.alertDelay;

  if (type.indexOf(suffix) === -1) {
    this.alert(`Image support format <strong>${type.join(",")}</strong>.`, delay, "error");
    return false;
  } else if ((file.size / 1024) > maxSize) {
    this.alert(`Image size is more than <strong>${maxSize}</strong> kb.`, delay, "error");
    return false;
  }

  return true;
}

export default function (file) {
  let options = this.options;
  let cm = this.codemirror;
  let delay = this.options.alertDelay;
  let url = options.uploads.url;

  // image validator
  if (!Reflect.apply(checkImage, this, [file])) return;

  let from = cm.getCursor("start");
  let uploadWidget = buildUploadWidget();
  let progress = uploadWidget.firstChild;
  cm.execCommand("newlineAndIndent");
  let bookmark = cm.setBookmark(from, {
    widget: uploadWidget
  });

  let formData = new FormData();
  let xhr = new XMLHttpRequest();

  xhr.open("post", url);
  xhr.onreadystatechange = function (response) {
    if (this.readyState === 4) {
      bookmark.clear();
      // write to parse your response data
      try {
        let data = JSON.parse(response);
        if (xhr.status === 200) {
          cm.setSelection(from);
          cm.replaceSelection(`![](${data.path})`);
        } else {
          this.alert(`Upload failed on: ${data.msg}`, delay, "error");
        }
      } catch (e) {
        console.warn("Smartmd: Json data cannot be parse check your request return");
      }
    }
  }.bind(this);

  xhr.upload.onprogress = (ev) => {
    if (ev.lengthComputable) {
      let value = 100 * (ev.loaded / ev.total);
      if (progress) {
        progress.style.width = value + "%";
        progress.innerText = Math.ceil(value) + "%";
      }
    }
  };

  formData.append("image", file);

  // try to get laravel csrf-token
  let token = getToken();
  if (token) xhr.setRequestHeader("X-CSRF-TOKEN", token);
  xhr.send(formData);
}


