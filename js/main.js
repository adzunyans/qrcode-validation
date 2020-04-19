// https://qiita.com/n0bisuke/items/78faeaeef59df716d7cf
// https://www.npmjs.com/package/qrcode-reader

const QrCode = require("qrcode-reader");

const $imageInput = document.querySelector(".file");
const $resultContainer = document.querySelector(".results");

const forbiddenDomains = ["line.me"];

let count = 0;
let qrReadErrorCount = 0;

$imageInput.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (!files && !files.length) return;

  console.log("file changes");
  const reader = new FileReader();
  reader.readAsDataURL(files[0]);

  reader.onload = async () => {
    console.log("fileReader onload");

    initResult();

    await imageProcess(reader.result);
    grayScale();
    qrCodeDecode();

    if (qrReadErrorCount !== 0) {
      initResult();
      await imageProcess(reader.result);
      invert();
      qrCodeDecode();
    }

    qrReadErrorCount = 0;
    count++;
  };
});

// OKだとtrue
function isValidQrCode(str) {
  return !forbiddenDomains.find((domain) => {
    const regExp = new RegExp("https://" + domain);
    return !!regExp.test(str);
  });
}

function initResult() {
  const $decodeResult = document.createElement("div");
  $decodeResult.classList.add("result");
  $decodeResult.setAttribute("id", `result_${count}`);
  $resultContainer.insertAdjacentElement("afterend", $decodeResult);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("id", `canvas_${count}`);
  $decodeResult.insertAdjacentElement("afterbegin", canvas);
}

function getResult() {
  return document.getElementById(`result_${count}`);
}

function getCanvas() {
  return document.getElementById(`canvas_${count}`);
}

function qrCodeDecode() {
  const qr = new QrCode();
  qr.callback = QRCodeProcess;
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  const base64 = ctx.getImageData(0, 0, canvas.width, canvas.height);
  qr.decode(base64);
}

// QRコードコールバック
function QRCodeProcess(err, value) {
  console.log("QRCodeProcess");
  const $decodeResult = getResult();
  const $isValid = document.createElement("div");

  if (err) {
    console.error(err);
    qrReadErrorCount += 1;
    return;
  }

  $decodeResult.insertAdjacentText("beforeend", `decode結果: ${value.result}`);

  if (!isValidQrCode(value.result)) {
    $isValid.insertAdjacentText("beforeend", `Forbid!`);
    $decodeResult.insertAdjacentElement("afterend", $isValid);
    return;
  }

  $isValid.insertAdjacentText("beforeend", `OK!`);
  $decodeResult.insertAdjacentElement("afterend", $isValid);
}

async function imageProcess(source) {
  console.log("imageProcess");

  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");

  const image = await loadImage(source).catch((e) => console.error(e));
  if (!image) return;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
}

function grayScale() {
  console.log("grayScale");

  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.height; i++) {
    for (let j = 0; j < imageData.width; j++) {
      const idx = (j + i * imageData.width) * 4;
      const gray = imageData.data[idx] / 3;
      imageData.data[idx] = gray;
      imageData.data[idx + 1] = gray;
      imageData.data[idx + 2] = gray;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function invert() {
  console.log("invert");

  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.height; i++) {
    for (let j = 0; j < imageData.width; j++) {
      const idx = (j + i * imageData.width) * 4;
      imageData.data[idx] = 255 - imageData.data[idx];
      imageData.data[idx + 1] = 255 - imageData.data[idx + 1];
      imageData.data[idx + 2] = 255 - imageData.data[idx + 2];
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
