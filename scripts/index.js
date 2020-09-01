window.onload = async function () {
  let imageUploadSection = document.querySelector("#image-upload-section");
  imageUploadSection.addEventListener("click", () => document.querySelector("#upload-prompt").click());

  let mobileNetModule = await mobilenet.load({ version: 2, alpha: 1 });
  let classifier = await trainModel(mobileNetModule);
  let selectedImage = tf.browser.fromPixels();
};

async function trainModel(mobileNetModule) {
  let classifier = knnClassifier.create();
  let maskImages = [], noMaskImages = [];

  for (let counter = 0; counter < 20; ++counter) {
    let maskImage = document.createElement("img"),
        noMaskImage = document.createElement("img");

    maskImage.setAttribute("src", `assets/training-samples/mask/${counter}.jpg`);
    noMaskImage.setAttribute("src", `assets/training-samples/no-mask/${counter}.jpg`);

    maskImages.push(maskImage);
    noMaskImages.push(noMaskImage);
  }

  maskImages.forEach(image =>
    classifier.addExample(mobilenetModule.infer(tf.browser.fromPixels(image), "conv_preds"), 1)
  );

  noMaskImages.forEach(image => 
    classifier.addExample(mobilenetModule.infer(tf.browser.fromPixels(image), "conv_preds"), 0)
  );

  return classifier;
}
