import {getToken} from '../utils';
import buildUploadWidget from '../../compontents/uploadwidget'

export function checkImage(file) {
  const uploads = this.options.uploads;
  const maxSize = uploads.maxSize;
  const type = uploads.type;
  const suffix = file.name.toLowerCase().split('.').splice(-1)[0];

  if (type.indexOf(suffix) === -1) {
    let error = uploads.typeError.replace('{type}', `<strong>${type.join(',')}</strong>`);
    this.alert(error, 'error');
    return false;
  }

  if ((file.size / 1024) > maxSize) {
    let error = uploads.sizeError.replace('{maxSize}', `<strong>${maxSize}</strong>`);
    this.alert(error, 'error');
    return false;
  }

  return true;
}

export default function (file) {
  const options = this.options;
  const cm = this.codemirror;
  const url = options.uploads.url;

  // image validator
  if (!checkImage.apply(this,[file])) return;

  const from = cm.getCursor('start');
  const uploadWidget = buildUploadWidget();
  const progress = uploadWidget.firstChild;
  cm.execCommand('newlineAndIndent');
  const bookmark = cm.setBookmark(from, {
    widget: uploadWidget
  });

  const formData = new FormData();
  const xhr = new XMLHttpRequest();

  xhr.open('post', url);
  xhr.onreadystatechange = function (response) {
    if (this.readyState === 4) {
      bookmark.clear();
      // write to parse your response data
      try {
        const data = JSON.parse(response);
        if (xhr.status === 200) {
          cm.setSelection(from);
          cm.replaceSelection(`![](${data.path})`);
        } else {
          const error = options.uploads.serverError.replace('{msg}', data.msg);
          this.alert(error, 'error');
        }
      } catch (e) {
        console.warn('Smartmd: Json data cannot be parse check your request return');
      }
    }
  }.bind(this);

  xhr.upload.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const value = 100 * (ev.loaded / ev.total);
      if (progress) {
        progress.style.width = `${value}%`;
        progress.innerText = `${Math.ceil(value)}%`;
      }
    }
  };

  formData.append('image', file);

  // try to get laravel csrf-token
  const token = getToken();
  if (token) xhr.setRequestHeader('X-CSRF-TOKEN', token);
  xhr.send(formData);
}


