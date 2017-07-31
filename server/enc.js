function encrypt(crypto, text) {
  let cipher = crypto.createCipher("aes-256-ctr", "peshkelmachalaq");
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}
function decrypt(crypt, text) {
  let decipher = crypto.createDecipher(algorithm, password);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

module.exports = {
  encrypt,
  decrypt
};
