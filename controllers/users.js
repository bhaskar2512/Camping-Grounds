const User = require('../models/user');

module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register');
}

module.exports.registerUser = async(req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        const user =new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,err=>{
            if(err)return next(err);
            req.flash('success','Welcome to the Yelp-Camp');
            res.redirect('/campgrounds');
        })
    } catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render('users/login');
}

module.exports.login = async(req,res)=>{
    req.flash('success','Welcome Back!!');
    res.redirect('/campgrounds');
}

module.exports.logout = (req,res)=>{
    req.logout();
    req.flash('success','GoodBye!');
    res.redirect('/campgrounds');
}