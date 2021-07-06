document.getElementById("imageUpload").onclick = function () {
  let xhttp = new XMLHttpRequest();

  const selectedImage = document.getElementById("selectedImage");
  const imageStatus = document.getElementById("imageStatus");
  const progressDev = document.getElementById("progressDev");
  const progressBar = document.getElementById("progressBar");
  const uploadResult = document.getElementById("uploadResult");

  xhttp.onreadystatechange = function () {
    if (xhttp.status === 200) {
      imageStatus.innerHTML = "successfully uploaded";
      uploadResult.innerHTML = this.responseText;
      selectedImage.value = "";
    } else {
      imageStatus.innerHTML = this.responseText;
    }
  };
  xhttp.open("POST", "/dashboard/image-upload");

  xhttp.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      let result = Math.floor((e.loaded / e.total) * 100);
      if (result !== 100) {
        progressBar.innerHTML = result + "%";
        progressBar.setAttribute("style", `width: ${result}%`);
      } else {
        progressDev.style = "display: none";
      }
    }
  };

  let formData = new FormData();

  if (selectedImage.files.length > 0) {
    progressDev.style = "display: block";
    formData.append("image", selectedImage.files[0]);
    xhttp.send(formData);
  } else {
    imageStatus.innerHTML = "please choose an image first";
  }
};
