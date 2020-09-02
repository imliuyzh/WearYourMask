window.onload = async function () {
  let mobileNetModule = await mobilenet.load({ version: 2, alpha: 1 }),
  classifier = await trainModel(mobileNetModule);

  let imageUploadSection = document.querySelector("#image-upload-section");
  imageUploadSection.addEventListener("click", () => document.querySelector("#upload-prompt").click());
  imageUploadSection.addEventListener("change", async (event) => {
    console.log(event);
    let tfTestImage = tf.browser.fromPixels(testImage);
    let logits = mobilenetModule.infer(tfTestImage, 'conv_preds');
    let prediction = await classifier.predictClass(logits);
    console.log(prediction);
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