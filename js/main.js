// https://qiita.com/n0bisuke/items/78faeaeef59df716d7cf
// https://www.npmjs.com/package/qrcode-reader

const QrCode = require("qrcode-reader");

const imageInput = document.querySelector(".file");

imageInput.addEventListener("change", (event) => {
  const files = event.target.files;
  if (!files && !files.length) return;
  console.log("change");
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);
  reader.onload = () => {
    const base64 = reader.result;
    var qr = new QrCode();
    qr.callback = function (err, value) {
      if (err) {
        console.error(err);
        // TODO handle error
      }
      console.log(value.result);
      const div = document.createElement("div");
      div.insertAdjacentText("beforeend", value.result);
      imageInput.insertAdjacentElement("afterend", div);
    };
    qr.decode(base64);
  };
});
