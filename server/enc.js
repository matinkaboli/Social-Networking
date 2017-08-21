// Encrypt password
function encrypt(crypto, text) {
  let cipher = crypto.createCipher("aes-256-ctr", "peshkelmachalaq");
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}
// Decrypt password
function decrypt(crypto, text) {
  let decipher = crypto.createDecipher("aes-256-ctr", "peshkelmachalaq");
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = {
  encrypt,
  decrypt
};
