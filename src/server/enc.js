const crypto = require("crypto");
// Encrypt password
const encrypt = text => {
  const cipher = crypto.createCipher("aes-256-ctr", "peshkelmachalaq");
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};
// Decrypt password
const decrypt = text => {
  const decipher = crypto.createDecipher("aes-256-ctr", "peshkelmachalaq");
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

module.exports = {
  encrypt,
  decrypt
};
