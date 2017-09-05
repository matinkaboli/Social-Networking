function status0() {
  sweetAlert("Oops...", "Please login first!", "warning");
}
function status1() {
  sweetAlert(
    "Oops...",
    "The username or email has been taken by someone else",
    "error"
  );
}
function status2() {
  swal("Deleted!", "Your account has been deleted.", "success");
}
function status3() {
  swal({
    title: "Sorry!",
    text: "There is no such username!",
    type: "warning"
  });
}
function status4() {
  swal(
    "Email has been sent.",
    "Check your email to change password",
    "success"
  );
}
function status5() {
  swal(
    "Password and re password are not equal",
    "Please write a correct password",
    "warning"
  );
}
function status6() {
  swal(
    "Set a strong password",
    "Your password has to be more than 8 letters",
    "warning"
  );
}
function status7() {
  swal(
    "There is an error!!",
    "Try again!",
    "error"
  );
}
function status8() {
  swal(
    "Your password changed.",
    "Now you can login.",
    "success"
  );
}
