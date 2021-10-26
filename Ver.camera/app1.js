const cameraSize = { w: 360, h: 240 };
const canvasSize = { w: 360, h: 240 };
const resolution = { w: 1080, h: 720 };
const minColor   = { r: 108, g: 0, b: 0 };
const maxColor   = { r: 255, g: 60, b: 60 };
let video;
let media;
let canvas;
let canvasCtx;

// video要素をつくる
video          = document.createElement('video');
video.id       = 'video';
video.width    = cameraSize.w;
video.height   = cameraSize.h;
video.autoplay = true;
document.getElementById('videoPreview1').appendChild(video);



// video要素にWebカメラの映像を表示させる
media = navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    width: { ideal: resolution.w },
    height: { ideal: resolution.h }
  }
}).then(function(stream) {
  video.srcObject = stream;
});

// canvas要素をつくる
canvas        = document.createElement('canvas');
canvas.id     = 'canvas';
canvas.width  = canvasSize.w;
canvas.height = canvasSize.h;
document.getElementById('canvasPreview').appendChild(canvas);

// コンテキストを取得する
canvasCtx = canvas.getContext('2d');


// video要素の映像をcanvasに描画する
_canvasUpdate();

function _canvasUpdate() {
  canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
  var imageData = canvasCtx.getImageData(0,0,canvasSize.w,canvasSize.h)
  var imgd = imageData.data;
  var len = imgd.length/4;
  for (var i = 0; i < len; ++i) {
  var gray = (imgd[i*4] + imgd[i*4+1] + imgd[i*4+2])/3;
  /*var gray = parseInt(imgd[i*4]*0.3 + imgd[i*4+1]*0.59 + imgd[i*4+2]*0.11);という方法も*/
  imgd[i*4] = gray;
  imgd[i*4+1] = gray;
  imgd[i*4+2] = gray;
  imgd[i*4+3] = 255;
  }
  // 変更した内容をcanvasの右側に戻す
  canvasCtx.putImageData(imageData, 0, 0);

  
 // _changePixelColor(); // ループにこれが追加される
  requestAnimationFrame(_canvasUpdate);
};

// canvasを1ピクセルずつ色を確認し、該当すれば色を変更する
function _changePixelColor() {
  // コンテキストからデータ取得
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data      = imageData.data; // rgba、1バイト×4のデータ

  // ここに現在のピクセル情報を入れていく
  const currentColor = {};

  // 1ピクセルずつ確認していく
  for(let i = 0, len = data.length; i < len; i += 4) {
    currentColor.r = data[i];
    currentColor.g = data[i + 1];
    currentColor.b = data[i + 2];

    // 指定したrgb内であれば黄色に変換する
    if(_checkTargetColor(currentColor, minColor, maxColor)) {
      data[i]     = 0;
      data[i + 1] = 0;
      data[i + 2] = 225;
      // data[i + 3] = 0; => アルファ値なので、0にすれば透明になる
    }
  }

  // ImageDataオブジェクトに、変更済みのRGBAデータ（変数data）を代入する
  imageData.data = data;

  // canvasに変更済みのImageDataオブジェクトを描画する
  canvasCtx.putImageData(imageData, 0, 0);
};

// 色の判定用の関数（引数：現在のピクセルのrgb、指定色の最小値、指定色の最大値）
// 指定したrgb内であれば true を返す
function _checkTargetColor(current, min, max) {
  if(min.r > current.r || current.r > max.r) return;
  if(min.g > current.g || current.g > max.g) return;
  if(min.b > current.b || current.b > max.b) return;
  return true;
};