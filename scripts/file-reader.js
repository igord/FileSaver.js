/* global FileReader */
export default ({ view, blob, isOctetStream }) => new Promise(resolve => {
  const isSafari = /constructor/i.test(view.HTMLElement) || view.safari;
  const isChromeIos = /CriOS\/[\d]+/.test(view.navigator.userAgent);

  if ((isChromeIos || (isOctetStream && isSafari)) && view.FileReader) {
    // Safari doesn't allow downloading of blob urls
    const reader = new FileReader();
    reader.onloadend = () => {
      let url = isChromeIos ? reader.result
        : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
      const popup = view.open(url, '_blank');
      if (!popup) view.location.assign(url);
      url = undefined; // release reference
      resolve(true);
    };
    reader.readAsDataURL(blob);
  } else {
    resolve(false);
  }
});
