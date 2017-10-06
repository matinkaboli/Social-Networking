const shit = require("./db");
const crypto = require("crypto");

shit.Ban.find({ }, (err, aff) => {
  if (err) throw err;
  console.log(aff);
});

// const decrypt = (text, u) => {
//   const decipher =
//     crypto.createDecipher("aes-256-cbc", `peshkelmachalaq${u}`);
//   let decrypted = decipher.update(text, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// };
