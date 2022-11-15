let timestamps = []
let aggregatedTimestamps = []

var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Functions

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function callEverySecond() {
    drawChart()
    setInterval(drawChart, 1000);
}

function drawChart() {
  groupTimestamps()
  // Do things in D3
  x.domain(aggregatedTimestamps.map(function(d) { return d.time; }));
  y.domain([0, d3.max(aggregatedTimestamps, function(d) { return d.count; })]);

  svg.selectAll("*").remove()
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Blink Count");

  svg.selectAll(".bar")
      .data(aggregatedTimestamps)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.time); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); })

  function type(d) {
    d.count = +d.count;
    return d;
  }
}

// function groupTimestamps() {
//   var oneMinuteAgo = new Date();
//   oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
//   var result = timestamps.filter(timestamp => timestamp > oneMinuteAgo)
//   aggregatedTimestamps.push({"count" : result.length, "time" : oneMinuteAgo})
//   console.log(aggregatedTimestamps)
// }

function groupTimestamps() {
  var oneSecondAgo = new Date();
  oneSecondAgo.setSeconds(oneSecondAgo.getSeconds() - 1);
  var result = timestamps.filter(timestamp => timestamp > oneSecondAgo)
  aggregatedTimestamps.push({"count" : result.length, "time" : oneSecondAgo})
  console.log(aggregatedTimestamps)
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

    if (distance(predictions[0].scaledMesh[159], predictions[0].scaledMesh[145]) < 8 &&
        distance(predictions[0].scaledMesh[386], predictions[0].scaledMesh[374]) < 8) {
      
      if ((timestamps.length == 0) || (Date.now() - timestamps[timestamps.length-1]) > 500) {
        timestamps.push(Date.now())
        console.log(timestamps)
      }
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
  var nextDate = new Date();
  if (nextDate.getSeconds() === 0) { // You can check for seconds here too
      callEverySecond()
  } else {
      nextDate.setSeconds(nextDate.getSeconds() + 1);

      var difference = nextDate - new Date();
      console.log(difference)
      setTimeout(callEverySecond, difference);
  }
};

main();