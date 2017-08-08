function showData(address) {
  fs.readFile(address, "utf8", (err, data) => {
    if (err) throw err;
    return data;
  });
}

module.exports = showData;
