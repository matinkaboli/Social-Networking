function removeFollowings(user, db) {
  if (user.follower.length > 0) {
    for (let i = 0; i < user.follower.length; i++) {
      db.find({ _id: user.follower[i] }, (err, tank) => {
        if (JSON.stringify(tank[0].following) != "[]") {
          let f = tank[0].following;
          let ind = f.indexOf(user._id);
          f.splice(ind, 1);
          tank[0].save((err, updatedTank) => {
            if (err) throw err;
          });
        }
      });
    }
  }
}
function removeFollowers(user, db) {
  if (user.following.length > 0) {
    for (let i = 0; i < user.following.length; i++) {
      db.find({ _id: user.following[i] }, (err, tank) => {
        if (JSON.stringify(tank[0].follower) !== "[]") {
          let f = tank[0].follower;
          let ind = f.indexOf(user._id);
          f.splice(ind, 1);
          tank[0].save((err, updatedTank) => {
            if (err) throw err;
          });
        }
      });
    }
  }
}

module.exports = {
  removeFollowings,
  removeFollowers
};
