const express=require("express"),session=require("express-session"),db=require("./db"),configs=require("./configure"),posts=require("./apppost"),gets=require("./appget"),token=require("./token"),app=express();configs(app,express,session),gets(app,db),posts(app,session,db),token(app,db),app.use((e,s,r)=>{s.status(404).render("notfound.njk",{url:e.originalUrl})}),app.listen(3e3,()=>{console.log("The server is running now.")});