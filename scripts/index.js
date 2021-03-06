/* global window, self */
import ieSave from './ie-save';
import aDownload from './a-download';
import fileReader from './file-reader';
import openAsUrl from './open-as-url';

const getView = () => {
  const view = (typeof self !== 'undefined' && self)
    || (typeof window !== 'undefined' && window)
    || this.content;
  if (typeof view === 'undefined'
      || (typeof window.navigator !== 'undefined'
          && /MSIE [1-9]\./.test(window.navigator.userAgent))
     ) {
    throw new Error('File can not be saved. No suitable view was found.');
  }
  return view;
};

const autoBom = (view, blob) => {
  // prepend BOM for UTF-8 XML and text/* types (including HTML)
  // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
  const regex = /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i;
  if (regex.test(blob.type)) {
    return new view.Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
  }
  return blob;
};

const objectUrl = (view, blob) => {
  const url = view.URL || view.webkitURL || view;
  let oUrl;
  return {
    create() {
      oUrl = url.createObjectURL(blob);
    },
    destroy() {
      if (oUrl) setTimeout(() => url.revokeObjectURL(oUrl), 1000 * 40);
    },
  };
};

export default (blob, name, noAutoBom) => {
  const view = getView();
  const saveData = {
    view,
    name: name || blob.name || 'download',
    blob: noAutoBom ? blob : autoBom(view, blob),
  };
  saveData.objectUrl = objectUrl(view, saveData.blob);
  saveData.isOctetStream = saveData.blob.type === 'application/octet-stream';

  return [ieSave, aDownload, fileReader, openAsUrl].reduce(
    (acc, method) => acc.then(status => status || method(saveData)),
    Promise.resolve(false)
  ).then(
    () => objectUrl.destroy()
  );
};

