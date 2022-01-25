const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if(token){
        jwt.verify(token, 'shhhhh', function(err, decoded) {
            if(err){
                console.log(err);
                res.redirect('/login');
            }else{
                console.log(decoded);     
                next();
            }
          });
    }else{
        res.redirect('/login')
    }

 }

 // check current user
 const checkUser = (req, res, next) =>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, 'shhhhh', async (err, decoded) => {
            if(err){
                console.log(err);
                res.locals.user = null;
                next();
            }else{
                console.log(decoded);  
                let user = await User.findById(decoded.id)  ;
                res.locals.user = user;
                next();
            }
          });
    }else{
        res.locals.user = null;
        next();

    }

 }

 module.exports =  { requireAuth, checkUser }; 