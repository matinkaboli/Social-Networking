const status0 = () => {
  sweetAlert("Oops...", "Please login first!", "warning");
};
const status1 = () => {
  sweetAlert(
    "Oops...",
    "The username or email has been taken by someone else",
    "error"
  );
};
const status2 = () => {
  swal("Deleted!", "Your account has been deleted.", "success");
};
const status3 = () => {
  swal({
    title: "Sorry!",
    text: "There is no such username!",
    type: "warning"
  });
};
const status4 = () => {
  swal(
    "Email has been sent.",
    "Check your email to change password",
    "success"
  );
};
const status5 = () => {
  swal(
    "Password and re password are not equal",
    "Please write a correct password",
    "warning"
  );
};
const status6 = () => {
  swal(
    "Set a strong password",
    "Your password has to be more than 8 letters",
    "warning"
  );
};
const status7 = () => {
  swal(
    "There is an error!!",
    "Try again!",
    "error"
  );
};
const status8 = () => {
  swal(
    "Your password changed.",
    "Now you can login.",
    "success"
  );
};
const status9 = () => {
  swal(
    "This account has been banned for 30 minutes.",
    "",
    "error"
  );
};
const status10 = () => {
  swal("The password is wrong.", "Try again", "error");
};
