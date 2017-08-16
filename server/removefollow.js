function removeFollowings(user, db) {
  if (user.following.length > 0) {
    for (let i = 0; i < user.following.length; i++) {
      db.find({ username: user.following[i] }, (err, tank) => {
        if (err) throw err;
        function findFollower(element) {
          return element.usern === user.username;
        }
        let f = tank[0].follower;
        let index = f.findIndex(findFollower);
        f.splice(index, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
        });
      });
    }
  }
}
function removeFollowers(user, db) {
  if (user.follower.length > 0) {
    for (let i = 0; i < user.follower.length; i++) {
      db.find({ username: user.follower[i] }, (err, tank) => {
        let f = tank[0].following;
        let ind = f.indexOf(user.username);
        f.splice(ind, 1);
        tank[0].save((err, updatedTank) => {
          if (err) throw err;
        });
      });
    }
  }
}

module.exports = {
  removeFollowings,
  removeFollowers
};
