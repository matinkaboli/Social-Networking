function imageSize(Jimp, folname, filename) {
  const fullName = folname + filename;
  Jimp.read(fullName)
    .then(lenna => {
      lenna.resize(300, 300).quality(60).write(fullName);
    })
    .catch(e => {
      console.log(e);
    });
}

module.exports = imageSize;
