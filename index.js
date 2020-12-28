function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user'
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function renderPrediction() {

  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
  // array of detected faces from the MediaPipe graph. If passing in a video
  // stream, a single prediction per frame will be returned.
  const predictions = await model.estimateFaces({
    input: document.querySelector("video")
  });

  if (predictions.length > 0) {
    // console.log(predictions)

    // for points 145 and 159 in the scaled model,
    // calculate the "close" event

    if (distance(predictions[0].scaledMesh[159], predictions[0].scaledMesh[145]) < 8) {
      console.log("blinked");

      var circle = d3.select("circle");
      var radius = circle.attr("r");
      circle.attr("r", parseInt(radius) + 5);
    }

    // for (let i = 0; i < predictions.length; i++) {
    //   const keypoints = predictions[i].scaledMesh;

    //   // Log facial keypoints.
    //   for (let i = 0; i < keypoints.length; i++) {
    //     const [x, y, z] = keypoints[i];

    //     console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
    //   }
    // }
  }

  rafID = requestAnimationFrame(renderPrediction);
}

async function main() {
  await setupCamera();
  video.play();
  console.log("camera set up")
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    {maxFaces: 1});
  console.log("model configured - ready to detect")
  renderPrediction();
};

main();