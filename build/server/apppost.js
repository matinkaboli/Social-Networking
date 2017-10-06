function validateEmail(e){return/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)}function validateUsername(e){return/^[a-zA-Z0-9]+([_ .]?[a-zA-Z0-9])*$/.test(e)}function validatePassword(e){return/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/.test(e)}const stringing=require("stringing"),multer=require("multer"),moment=require("moment"),imageSize=require("./imagesize"),mail=require("./mail"),enc=require("./enc"),removeFile=require("./fs"),msg=require("./msg"),savePost=require("./posts"),showData=require("./showdata"),gen=require("./gen"),{removeUserData:removeUserData}=require("./removeuserdata"),{removeOldImage:removeOldImage}=require("./removeuserdata"),{removeFollowings:removeFollowings}=require("./removefollow"),{removeFollowers:removeFollowers}=require("./removefollow"),{removePost:removePost}=require("./removeuserdata"),posts=(e,s,o)=>{const t=multer({dest:"public/profile/"});e.post("/",(e,s)=>{const t=e.body.username.toLowerCase(),r=e.body.email.toLowerCase(),n=stringing.unique(40),i=!!e.body.showemail,a=e.body.password,d=e.body.name;if(t&&r&&a&&d)if(e.body.captcha===e.session.captcha)if(validateEmail(r)&&validateUsername(t)&&validatePassword(a)){e.session.captcha=null;const c=new o.User({password:enc.encrypt(a,t),emailurl:n,showEmail:i,username:t,email:r,name:d,likes:0,times:0,mistakes:0,created:Date.now()});o.checkUserAndEmail(t,r).then(o=>{e.session.user=t,c.save().then(()=>{s.render("admin.njk",{data:{username:t,name:d}})}).catch(e=>{console.error(e)}),mail(r,n,0)}).catch(o=>{e.flash("status","status1"),s.redirect("/")})}else s.redirect("/");else s.redirect("/");else e.flash("status","status7"),s.redirect("/")}),e.post("/checkusername",(e,s)=>{const t=e.body.username.toLowerCase();o.checkUsername(t).then(o=>{e.body.ok=!1,s.json(e.body)}).catch(o=>{e.body.ok=!0,s.json(e.body)})}),e.post("/checkemail",(e,s)=>{const t=e.body.email.toLowerCase();o.checkEmail(t).then(o=>{e.body.ok=!1,s.json(e.body)}).catch(o=>{e.body.ok=!0,s.json(e.body)})}),e.post("/login",(e,s)=>{const t=e.body.username.toLowerCase();o.User.find({username:t},(r,n)=>{if(r)throw r;"[]"!==JSON.stringify(n)?o.Ban.find({user:n[0]._id},(r,i)=>{"[]"===JSON.stringify(i)?o.ckeckUserAndPassword(t,enc.encrypt(e.body.password,t)).then(o=>{o[0].times=0,o[0].mistakes=0,o[0].save(o=>{if(o)throw o;e.session.user=t,s.redirect("/you")})}).catch(t=>{console.log(n),(n[0].times+1)%15==0&&(new o.Ban({user:n[0]._id}).save().then(()=>{mail(n[0].email,"XXX.XXX.XXX.XXX",2,n[0].username)}).catch(e=>{console.error(e)}),n[0].times=0),n[0].times=n[0].times+1,n[0].save(o=>{if(o)throw o;e.flash("status","status10"),s.redirect("/")})}):(e.flash("status","status9"),s.redirect("/"))}):(e.flash("status","status3"),s.redirect("/"))})}),e.post("/setting",t.single("avatar"),(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase(),n=e.body.email.toLowerCase(),i={description:{}};e.body.name&&(i.name=e.body.name),e.body.about&&(i.description.about=e.body.about),e.body.address&&(i.description.address=e.body.address),e.body.link&&(i.description.link=e.body.link),"male"===e.body.sex?i.description.sex=!0:"female"===e.body.sex&&(i.description.sex=!1),"married"===e.body.case?i.description.case=!0:"single"===e.body.case&&(i.description.case=!1),e.body.showemail?i.showEmail=!0:i.showEmail=!1;(async()=>{const a=o.checkUsername(r).catch(s=>{""!==r&&validateUsername(r)&&(i.username=r,e.session.user=r)}),d=o.checkBy("email",n).catch(e=>{""!==n&&validateEmail(n)&&(i.email=n)}),c=o.checkUsername(t).then(s=>{if(e.file){const o=e.file.mimetype;if("image/jpeg"===o||"image/png"===o){const o=e.file.filename;i.description.avatar=o+"a",imageSize(o),s[0].description.avatar&&removeOldImage(s[0].description.avatar)}else i.description.avatar=s[0].description.avatar,removeOldImage(e.file.filename)}else s[0].description&&s[0].description.avatar&&(i.description.avatar=s[0].description.avatar)}).catch(e=>{console.error(e)});await a,await d,await c;o.User.update({username:t},i,(e,o)=>{s.redirect("/you")})})()}),e.post("/changepass",(e,s)=>{const t=e.session.user.toLowerCase(),r={password:enc.encrypt(e.body.oldpassword,t),username:t},n={};e.body.newpassword===e.body.repassword&&validatePassword(e.body.newpassword)&&(n.password=enc.encrypt(e.body.newpassword,t)),o.User.update(r,n,(o,t)=>{1==t.nModified?s.redirect("/you"):(e.flash("status","status0"),console.error("Did not save."),s.redirect("/you"))})}),e.post("/logout",(e,s)=>{e.session.destroy(),s.redirect("/")}),e.post("/follow",(e,s)=>{const t=e.headers.referer.split("/"),r=t[t.length-1].toLowerCase();let n,i;(async()=>{const t=o.checkUsername(e.session.user.toLowerCase()).then(e=>{n=e[0]._id}).catch(e=>{console.error(e)}),a=o.checkUsername(r).then(e=>{i=e[0]._id}).catch(e=>{console.error(e)});await t,await a;o.User.find({username:r},(t,a)=>{if(t)throw t;-1==a[0].follower.indexOf(n)?e.session.user.toLowerCase()!==r&&(a[0].follower.push(n),a[0].save((t,r)=>{if(t)throw t;o.User.find({username:e.session.user.toLowerCase()},(o,t)=>{if(o)throw o;t[0].following.push(i),t[0].save((o,t)=>{if(e.body.fo="followed",s.json(e.body),o)throw o})})})):(e.body.fo="followed",s.json(e.body))})})()}),e.post("/unfollow",(e,s)=>{const t=e.headers.referer.split("/"),r=t[t.length-1].toLowerCase();let n,i;(async()=>{const t=o.checkUsername(e.session.user.toLowerCase()).then(e=>{n=e[0]._id}).catch(e=>{console.error(e)}),a=o.checkUsername(r).then(e=>{i=e[0]._id}).catch(e=>{console.error(e)});await t,await a;o.User.find({username:r},(e,s)=>{if(e)throw e;const o=s[0].follower,t=o.indexOf(n);o.splice(t,1),s[0].save((e,s)=>{if(e)throw e})}),o.User.find({username:e.session.user.toLowerCase()},(o,t)=>{if(o)throw o;const r=t[0].following,n=r.indexOf(i);r.splice(n,1),t[0].save((o,t)=>{if(o)throw o;e.body.fo="unfollowed",s.json(e.body)})})})()}),e.post("/delete",(e,s)=>{const t={username:e.session.user.toLowerCase()};o.User.find(t,(r,n)=>{if(removePost(n[0]._id,o),n[0].description.avatar){removeFile("/home/matin/Documents/projects/facebook/build/public/profile/"+n[0].description.avatar)}removeUserData(n[0]._id),removeFollowings(n[0],o.User),removeFollowers(n[0],o.User),o.User.find(t).remove((o,t)=>{if(o)throw o;e.flash("status","status2"),s.redirect("/"),e.session.destroy()})})}),e.post("/contact",(e,s)=>{const o=e.body;msg(o.name,o.email.toLowerCase(),o.content),s.json({ok:!0})}),e.post("/sendpost",(e,s)=>{const t=Date.now(),r=e.body.username.toLowerCase(),n=e.body.content,i=e.body.title;if(r&&n&&i){const a=stringing.unique(40);o.User.find({username:r},(r,d)=>{if(r)throw r;savePost(d[0]._id,n,a),new o.Post({_id:a,time:t,user:d[0]._id,title:i}).save().then(()=>{s.json(e.body)})})}else s.json({status:0})}),e.post("/allposts",(e,s)=>{o.User.find({username:e.body.username.toLowerCase()},(e,t)=>{o.Post.find({user:t[0]._id},(e,o)=>{if(0===o.length)s.json({ok:!1});else{const e={ok:!0,len:o.length,posts:o};s.json(e)}})})}),e.post("/deleteavatar",(e,s)=>{const t={username:e.session.user.toLowerCase()};o.User.find(t).then(e=>{removeFile("/home/matin/Documents/projects/facebook/build/public/profile/"+e[0].description.avatar),e[0].description.avatar=void 0,e[0].save().then(()=>{s.redirect("/you")}).catch(e=>{console.error(e)})})}),e.post("/getinfofollow",(e,s)=>{const t=new Set(e.body.sp);t.delete("");const r=Array.from(t);for(let e=0;e<r.length;e++)r[e]=parseInt(r[e]);const n=[],i=gen.getData(r,o,n);!function e(){const o=i.next();o.done?s.json(n):o.value.then(e)}()}),e.post("/forgot",(e,s)=>{const t=e.body.username.toLowerCase();o.User.find({username:t},(o,t)=>{if("[]"==JSON.stringify(t))e.flash("status","status3"),s.redirect("/");else{const o=stringing.unique(40)+"0"+t[0].username;mail(t[0].email,o,1),t[0].forgot=o,t[0].save((o,t)=>{e.flash("status","status4"),s.redirect("/")})}})}),e.post("/forgotchange",(e,s)=>{const t=e.body.pass,r=e.body.repass;if(t===r)if(t.length<9)s.redirect("/");else{const r=e.body.unq,n=r.split("0"),i=n[n.length-1];o.User.find({username:i},(o,n)=>{if("[]"==JSON.stringify(n))e.flash("status","status7"),s.redirect("/");else if(n[0].forgot===r){const o=enc.encrypt(t,i);n[0].password=o,n[0].forgot=null,n[0].save((o,t)=>{e.flash("status","status8"),s.redirect("/")})}else e.flash("status","status7"),s.redirect("/")})}else e.flash("status","status5"),s.redirect("/")}),e.post("/dislike",(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase();o.User.find({username:t},(t,n)=>{"[]"===JSON.stringify(n)?s.json({ok:!1}):o.User.find({username:r},(t,r)=>{if("[]"===JSON.stringify(r))s.json({ok:!1});else{const t=n[0]._id;r[0]._id;o.Post.find({_id:e.body._id},(e,o)=>{if("[]"==JSON.stringify(o))s.json({ok:!1});else{const e=o[0].likes.indexOf(t);-1!==e?(o[0].likes.splice(e,1),n[0].likes=n[0].likes-1,n[0].save(e=>{if(e)throw e;s.json({ok:!0})}),o[0].save(e=>{if(e)throw e})):s.json({ok:!1})}})}})})}),e.post("/like",(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase();o.User.find({username:t},(t,n)=>{"[]"===JSON.stringify(n)?s.json({ok:!1}):o.User.find({username:r},(t,r)=>{if("[]"===JSON.stringify(r))s.json({ok:!1});else{const t=n[0]._id;r[0]._id;o.Post.find({_id:e.body._id},(e,o)=>{if("[]"==JSON.stringify(o))s.json({ok:!1});else{const e=e=>e===t;o[0].likes.some(e)?s.json({ok:!1}):(o[0].likes.push(t),n[0].likes=n[0].likes+1,n[0].save(e=>{if(e)throw e;s.json({ok:!0})}),o[0].save(e=>{if(e)throw e}))}})}})})}),e.post("/morepost",(e,s)=>{const t=10*e.body.enumerate,r=e.body.username,n=e.body.watcher;o.User.find({username:r}).then(e=>{if("[]"===JSON.stringify(e))s.json({ok:!1});else{const r=e[0]._id;o.Post.find({user:r}).skip(t).limit(10).sort({time:1}).then(e=>{"[]"===JSON.stringify(e)?s.json({done:!0}):o.User.find({username:n}).then(n=>{if("[]"===JSON.stringify(n))s.json({ok:!1});else{const i=n[0]._id,a=[],d=gen.getInfo(e,i,a);!function e(){const n=d.next();n.done?o.Post.find({user:r}).skip(t+10).sort({time:1}).then(e=>{"[]"===JSON.stringify(e)?s.json({done:!0,list:a}):s.json({done:!1,list:a})}):n.value.then(e)}()}})})}})}),e.post("/checkip",(e,s)=>{s.json(e.body)})};module.exports=((e,s,o)=>{const t=multer({dest:"public/profile/"});e.post("/",(e,s)=>{const t=e.body.username.toLowerCase(),r=e.body.email.toLowerCase(),n=stringing.unique(40),i=!!e.body.showemail,a=e.body.password,d=e.body.name;if(t&&r&&a&&d)if(e.body.captcha===e.session.captcha)if(validateEmail(r)&&validateUsername(t)&&validatePassword(a)){e.session.captcha=null;const c=new o.User({password:enc.encrypt(a,t),emailurl:n,showEmail:i,username:t,email:r,name:d,likes:0,times:0,mistakes:0,created:Date.now()});o.checkUserAndEmail(t,r).then(o=>{e.session.user=t,c.save().then(()=>{s.render("admin.njk",{data:{username:t,name:d}})}).catch(e=>{console.error(e)}),mail(r,n,0)}).catch(o=>{e.flash("status","status1"),s.redirect("/")})}else s.redirect("/");else s.redirect("/");else e.flash("status","status7"),s.redirect("/")}),e.post("/checkusername",(e,s)=>{const t=e.body.username.toLowerCase();o.checkUsername(t).then(o=>{e.body.ok=!1,s.json(e.body)}).catch(o=>{e.body.ok=!0,s.json(e.body)})}),e.post("/checkemail",(e,s)=>{const t=e.body.email.toLowerCase();o.checkEmail(t).then(o=>{e.body.ok=!1,s.json(e.body)}).catch(o=>{e.body.ok=!0,s.json(e.body)})}),e.post("/login",(e,s)=>{const t=e.body.username.toLowerCase();o.User.find({username:t},(r,n)=>{if(r)throw r;"[]"!==JSON.stringify(n)?o.Ban.find({user:n[0]._id},(r,i)=>{"[]"===JSON.stringify(i)?o.ckeckUserAndPassword(t,enc.encrypt(e.body.password,t)).then(o=>{o[0].times=0,o[0].mistakes=0,o[0].save(o=>{if(o)throw o;e.session.user=t,s.redirect("/you")})}).catch(t=>{console.log(n),(n[0].times+1)%15==0&&(new o.Ban({user:n[0]._id}).save().then(()=>{mail(n[0].email,"XXX.XXX.XXX.XXX",2,n[0].username)}).catch(e=>{console.error(e)}),n[0].times=0),n[0].times=n[0].times+1,n[0].save(o=>{if(o)throw o;e.flash("status","status10"),s.redirect("/")})}):(e.flash("status","status9"),s.redirect("/"))}):(e.flash("status","status3"),s.redirect("/"))})}),e.post("/setting",t.single("avatar"),(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase(),n=e.body.email.toLowerCase(),i={description:{}};e.body.name&&(i.name=e.body.name),e.body.about&&(i.description.about=e.body.about),e.body.address&&(i.description.address=e.body.address),e.body.link&&(i.description.link=e.body.link),"male"===e.body.sex?i.description.sex=!0:"female"===e.body.sex&&(i.description.sex=!1),"married"===e.body.case?i.description.case=!0:"single"===e.body.case&&(i.description.case=!1),e.body.showemail?i.showEmail=!0:i.showEmail=!1,(async()=>{const a=o.checkUsername(r).catch(s=>{""!==r&&validateUsername(r)&&(i.username=r,e.session.user=r)}),d=o.checkBy("email",n).catch(e=>{""!==n&&validateEmail(n)&&(i.email=n)}),c=o.checkUsername(t).then(s=>{if(e.file){const o=e.file.mimetype;if("image/jpeg"===o||"image/png"===o){const o=e.file.filename;i.description.avatar=o+"a",imageSize(o),s[0].description.avatar&&removeOldImage(s[0].description.avatar)}else i.description.avatar=s[0].description.avatar,removeOldImage(e.file.filename)}else s[0].description&&s[0].description.avatar&&(i.description.avatar=s[0].description.avatar)}).catch(e=>{console.error(e)});await a,await d,await c,o.User.update({username:t},i,(e,o)=>{s.redirect("/you")})})()}),e.post("/changepass",(e,s)=>{const t=e.session.user.toLowerCase(),r={password:enc.encrypt(e.body.oldpassword,t),username:t},n={};e.body.newpassword===e.body.repassword&&validatePassword(e.body.newpassword)&&(n.password=enc.encrypt(e.body.newpassword,t)),o.User.update(r,n,(o,t)=>{1==t.nModified?s.redirect("/you"):(e.flash("status","status0"),console.error("Did not save."),s.redirect("/you"))})}),e.post("/logout",(e,s)=>{e.session.destroy(),s.redirect("/")}),e.post("/follow",(e,s)=>{const t=e.headers.referer.split("/"),r=t[t.length-1].toLowerCase();let n,i;(async()=>{const t=o.checkUsername(e.session.user.toLowerCase()).then(e=>{n=e[0]._id}).catch(e=>{console.error(e)}),a=o.checkUsername(r).then(e=>{i=e[0]._id}).catch(e=>{console.error(e)});await t,await a,o.User.find({username:r},(t,a)=>{if(t)throw t;-1==a[0].follower.indexOf(n)?e.session.user.toLowerCase()!==r&&(a[0].follower.push(n),a[0].save((t,r)=>{if(t)throw t;o.User.find({username:e.session.user.toLowerCase()},(o,t)=>{if(o)throw o;t[0].following.push(i),t[0].save((o,t)=>{if(e.body.fo="followed",s.json(e.body),o)throw o})})})):(e.body.fo="followed",s.json(e.body))})})()}),e.post("/unfollow",(e,s)=>{const t=e.headers.referer.split("/"),r=t[t.length-1].toLowerCase();let n,i;(async()=>{const t=o.checkUsername(e.session.user.toLowerCase()).then(e=>{n=e[0]._id}).catch(e=>{console.error(e)}),a=o.checkUsername(r).then(e=>{i=e[0]._id}).catch(e=>{console.error(e)});await t,await a,o.User.find({username:r},(e,s)=>{if(e)throw e;const o=s[0].follower,t=o.indexOf(n);o.splice(t,1),s[0].save((e,s)=>{if(e)throw e})}),o.User.find({username:e.session.user.toLowerCase()},(o,t)=>{if(o)throw o;const r=t[0].following,n=r.indexOf(i);r.splice(n,1),t[0].save((o,t)=>{if(o)throw o;e.body.fo="unfollowed",s.json(e.body)})})})()}),e.post("/delete",(e,s)=>{const t={username:e.session.user.toLowerCase()};o.User.find(t,(r,n)=>{removePost(n[0]._id,o),n[0].description.avatar&&removeFile("/home/matin/Documents/projects/facebook/build/public/profile/"+n[0].description.avatar),removeUserData(n[0]._id),removeFollowings(n[0],o.User),removeFollowers(n[0],o.User),o.User.find(t).remove((o,t)=>{if(o)throw o;e.flash("status","status2"),s.redirect("/"),e.session.destroy()})})}),e.post("/contact",(e,s)=>{const o=e.body;msg(o.name,o.email.toLowerCase(),o.content),s.json({ok:!0})}),e.post("/sendpost",(e,s)=>{const t=Date.now(),r=e.body.username.toLowerCase(),n=e.body.content,i=e.body.title;if(r&&n&&i){const a=stringing.unique(40);o.User.find({username:r},(r,d)=>{if(r)throw r;savePost(d[0]._id,n,a),new o.Post({_id:a,time:t,user:d[0]._id,title:i}).save().then(()=>{s.json(e.body)})})}else s.json({status:0})}),e.post("/allposts",(e,s)=>{o.User.find({username:e.body.username.toLowerCase()},(e,t)=>{o.Post.find({user:t[0]._id},(e,o)=>{if(0===o.length)s.json({ok:!1});else{const e={ok:!0,len:o.length,posts:o};s.json(e)}})})}),e.post("/deleteavatar",(e,s)=>{const t={username:e.session.user.toLowerCase()};o.User.find(t).then(e=>{removeFile("/home/matin/Documents/projects/facebook/build/public/profile/"+e[0].description.avatar),e[0].description.avatar=void 0,e[0].save().then(()=>{s.redirect("/you")}).catch(e=>{console.error(e)})})}),e.post("/getinfofollow",(e,s)=>{const t=new Set(e.body.sp);t.delete("");const r=Array.from(t);for(let e=0;e<r.length;e++)r[e]=parseInt(r[e]);const n=[],i=gen.getData(r,o,n);!function e(){const o=i.next();o.done?s.json(n):o.value.then(e)}()}),e.post("/forgot",(e,s)=>{const t=e.body.username.toLowerCase();o.User.find({username:t},(o,t)=>{if("[]"==JSON.stringify(t))e.flash("status","status3"),s.redirect("/");else{const o=stringing.unique(40)+"0"+t[0].username;mail(t[0].email,o,1),t[0].forgot=o,t[0].save((o,t)=>{e.flash("status","status4"),s.redirect("/")})}})}),e.post("/forgotchange",(e,s)=>{const t=e.body.pass,r=e.body.repass;if(t===r)if(t.length<9)s.redirect("/");else{const r=e.body.unq,n=r.split("0"),i=n[n.length-1];o.User.find({username:i},(o,n)=>{if("[]"==JSON.stringify(n))e.flash("status","status7"),s.redirect("/");else if(n[0].forgot===r){const o=enc.encrypt(t,i);n[0].password=o,n[0].forgot=null,n[0].save((o,t)=>{e.flash("status","status8"),s.redirect("/")})}else e.flash("status","status7"),s.redirect("/")})}else e.flash("status","status5"),s.redirect("/")}),e.post("/dislike",(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase();o.User.find({username:t},(t,n)=>{"[]"===JSON.stringify(n)?s.json({ok:!1}):o.User.find({username:r},(t,r)=>{if("[]"===JSON.stringify(r))s.json({ok:!1});else{const t=n[0]._id;r[0]._id,o.Post.find({_id:e.body._id},(e,o)=>{if("[]"==JSON.stringify(o))s.json({ok:!1});else{const e=o[0].likes.indexOf(t);-1!==e?(o[0].likes.splice(e,1),n[0].likes=n[0].likes-1,n[0].save(e=>{if(e)throw e;s.json({ok:!0})}),o[0].save(e=>{if(e)throw e})):s.json({ok:!1})}})}})})}),e.post("/like",(e,s)=>{const t=e.session.user.toLowerCase(),r=e.body.username.toLowerCase();o.User.find({username:t},(t,n)=>{"[]"===JSON.stringify(n)?s.json({ok:!1}):o.User.find({username:r},(t,r)=>{if("[]"===JSON.stringify(r))s.json({ok:!1});else{const t=n[0]._id;r[0]._id,o.Post.find({_id:e.body._id},(e,o)=>{if("[]"==JSON.stringify(o))s.json({ok:!1});else{const e=e=>e===t;o[0].likes.some(e)?s.json({ok:!1}):(o[0].likes.push(t),n[0].likes=n[0].likes+1,n[0].save(e=>{if(e)throw e;s.json({ok:!0})}),o[0].save(e=>{if(e)throw e}))}})}})})}),e.post("/morepost",(e,s)=>{const t=10*e.body.enumerate,r=e.body.username,n=e.body.watcher;o.User.find({username:r}).then(e=>{if("[]"===JSON.stringify(e))s.json({ok:!1});else{const r=e[0]._id;o.Post.find({user:r}).skip(t).limit(10).sort({time:1}).then(e=>{"[]"===JSON.stringify(e)?s.json({done:!0}):o.User.find({username:n}).then(n=>{if("[]"===JSON.stringify(n))s.json({ok:!1});else{const i=n[0]._id,a=[],d=gen.getInfo(e,i,a);!function e(){const n=d.next();n.done?o.Post.find({user:r}).skip(t+10).sort({time:1}).then(e=>{"[]"===JSON.stringify(e)?s.json({done:!0,list:a}):s.json({done:!1,list:a})}):n.value.then(e)}()}})})}})}),e.post("/checkip",(e,s)=>{s.json(e.body)})});