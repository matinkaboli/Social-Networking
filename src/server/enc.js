const crypto = require("crypto");
// Encrypt password
const encrypt = (text, u) => {
  const cipher =
    crypto.createCipher("aes-256-cbc", `peshkelmachalaq${u}`);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};
// Decrypt password
const decrypt = (text, u) => {
  const decipher =
    crypto.createDecipher("aes-256-cbc", `peshkelmachalaq${u}`);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = {
  encrypt,
  decrypt
};
