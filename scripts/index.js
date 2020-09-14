import { detect, loadModel } from "./detection.js";

/**
 * Register listeners for the image upload section
 * and initialize the required ML model.
 */
window.onload = async function () {
  await loadModel();
  let imageUploadSection = document.querySelector("#image-upload-section");
  imageUploadSection.addEventListener("click", () => document.querySelector("#upload-prompt").click());
  imageUploadSection.addEventListener("change", event => {
    let fileReader = new FileReader();
    fileReader.onload = function() {
      let temp = new Image();
      temp.onload = function() {
        let testImage = document.createElement('img');
        testImage.setAttribute('width', temp.width);
        testImage.setAttribute('height', temp.height);
        testImage.src = fileReader.result;
        displayResult(testImage);
      };
      temp.src = fileReader.result;
    };
    fileReader.readAsDataURL(event.target.files[0]);
  });
};

/**
 * Show the message depending on the existence of users' mask.
 * @param {Image} testImage An image file that the user uploads
 */
function displayResult(testImage) {
  detect(testImage)
    .then(result => (result[0][1] === 1) ? showAlert() : confirmDetection())
    .catch(() => showAlert());
}

/**
 * Display an alarm message in red when the mask is not detected.
 */
function showAlert() {
  let alertContainer = document.createElement('div');
  alertContainer.classList.add('alert');
  alertContainer.style.backgroundColor = '#F44336';
  alertContainer.innerText = `Failed to Detect a Mask. Please Wear it! (Press this to Dismiss)`;
  alertContainer.addEventListener('click', event => document.querySelector('body').removeChild(event.target));
  document.querySelector('body').appendChild(alertContainer);
}

/**
 * Display a message in green when the mask is detected.
 */
function confirmDetection() {
  let alertContainer = document.createElement('div');
  alertContainer.classList.add('alert');
  alertContainer.style.backgroundColor = '#4CAF50';
  alertContainer.innerText = `Mask Detected. Please Keep Wearing it! (Press this to Dismiss)`;
  alertContainer.addEventListener('click', event => document.querySelector('body').removeChild(event.target));
  document.querySelector('body').appendChild(alertContainer);
}