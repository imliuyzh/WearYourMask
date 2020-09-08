window.onload = async function () {
  let mobileNetModule = await mobilenet.load({ version: 2, alpha: 1 }),
  classifier = await trainModel(mobileNetModule);

  let imageUploadSection = document.querySelector("#image-upload-section");
  imageUploadSection.addEventListener("click", () => document.querySelector("#upload-prompt").click());
  imageUploadSection.addEventListener("change", async (event) => {
    let fileReader = new FileReader();
    fileReader.onload = function() {
      let temp = new Image();
      temp.onload = async function() {
        let testImage = document.createElement('img');
        testImage.setAttribute('width', temp.width);
        testImage.setAttribute('height', temp.height);
        testImage.src = fileReader.result;
        testImage.setAttribute('id', 'selected-image');
        testImage.style.display = 'None';
        document.querySelector('body').appendChild(testImage);
        await displayResult(mobileNetModule, classifier);
      };
      temp.src = fileReader.result;
    };
    fileReader.readAsDataURL(event.target.files[0]);
  });
};

async function trainModel(mobileNetModule) {
  let classifier = knnClassifier.create();
  let [maskImages, noMaskImages] = addImages();
  maskImages.forEach(image =>
    classifier.addExample(mobileNetModule.infer(tf.browser.fromPixels(image), "conv_preds"), 1)
  );
  noMaskImages.forEach(image => 
    classifier.addExample(mobileNetModule.infer(tf.browser.fromPixels(image), "conv_preds"), 0)
  );
  return classifier;
}

function addImages() {
  let maskImages = [], noMaskImages = [];
  for (let counter = 1; counter <= 20; ++counter) {
    let maskImage = document.createElement("img"),
        noMaskImage = document.createElement("img");

    maskImage.setAttribute("src", `assets/training-samples/mask/${counter}.jpg`);
    maskImage.setAttribute("width", "100%");
    maskImage.setAttribute("height", "100%");
    maskImages.push(maskImage);

    noMaskImage.setAttribute("src", `assets/training-samples/no-mask/${counter}.jpg`);
    noMaskImage.setAttribute("width", "100%");
    noMaskImage.setAttribute("height", "100%");
    noMaskImages.push(noMaskImage);
  }
  return [maskImages, noMaskImages];
}

async function displayResult(mobileNetModule, classifier) {
  let prediction = await classifier.predictClass(mobileNetModule.infer(tf.browser.fromPixels(document.querySelector('#selected-image')), 'conv_preds'));
  if (prediction.label === '0') {
    let alertContainer = document.createElement('div');
    alertContainer.classList.add('alert');
    alertContainer.style.backgroundColor = '#F44336';
    alertContainer.innerText = `Failed to Detect a Mask. Please Wear it! (Press this notification to close)`;
    alertContainer.addEventListener('click', event => document.querySelector('body').removeChild(event.srcElement));
    document.querySelector('body').appendChild(alertContainer);
  } else {
    let alertContainer = document.createElement('div');
    alertContainer.classList.add('alert');
    alertContainer.style.backgroundColor = '#4CAF50';
    alertContainer.innerText = `Mask Detected. Please Keep Wearing it! (Press this notification to close)`;
    alertContainer.addEventListener('click', event => document.querySelector('body').removeChild(event.srcElement));
    document.querySelector('body').appendChild(alertContainer);
  }

  let selectedImage = document.querySelector('#selected-image');
  selectedImage.parentNode.removeChild(selectedImage);
}