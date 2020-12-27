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
    console.log(predictions)

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

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    {maxFaces: 1});
  renderPrediction();
};

main();