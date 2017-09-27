const showData = require("./showdata");
const moment = require("moment");

function* getInfo(docP, id, list) {
  for (const post of docP) {
    yield new Promise(resolve => {
      const dir = "maindir/userpost";
      showData(`${dir}/${id}/${post._id}`)
        .then(dataPost => {
          const findA = e => e === id;
          const isLiked = post.likes.some(findA);
          const obj = {
            time: moment(post.time).fromNow(),
            title: post.title,
            content: dataPost,
            _id: post._id,
            likes: post.likes,
          };
          if (isLiked) {
            obj.like = true;
          } else {
            obj.like = false;
          }
          list.push(obj);
          resolve();
        })
        .catch(e => {
          console.error(e);
        });
    });
  }
}
function* getData(arr, db, list) {
  for (const _id of arr) {
    yield new Promise(resolve => {
      db.User.find({ _id }).then(doc => {
        const obj = {
          avatar: doc[0].description.avatar,
          username: doc[0].username
        }
        list.push(obj);
        resolve();
      });
    });
  }
}
function* getInfoSearch(doc, db, list) {
  for (const i of doc) {
    yield new Promise(resolve => {
      const dir = "maindir/userpost";
      showData(`${dir}/${i.user}/${i._id}`)
        .then(dataPost => {
          db.User.find({ _id: i.user }, (err, userInfo) => {
            const obj = {
              title: i.title,
              time: moment(i.tile).fromNow(),
              content: dataPost,
              id: i._id,
              likes: i.likes.length,
              user: userInfo[0].username
            };
            if (userInfo[0].description.avatar) {
              obj.avatar = userInfo[0].description.avatar;
              obj.status = 0;
            } else {
              obj.avatar = "/default/man.jpg";
              obj.status = 1;
            }
            list.push(obj);
            resolve();
          });
        });
    });
  }
}
module.exports = {
  getInfo,
  getInfoSearch,
  getData
};
