const token=(e,n)=>{e.get("/token/:token",(e,o)=>{const t=e.params.token;n.checkToken(t).then(()=>{o.send("Email verified. Go to <a href='/login'>Login</a>")}).catch(e=>{o.send("Dont have such token.")})})};module.exports=((e,n)=>{e.get("/token/:token",(e,o)=>{const t=e.params.token;n.checkToken(t).then(()=>{o.send("Email verified. Go to <a href='/login'>Login</a>")}).catch(e=>{o.send("Dont have such token.")})})});