const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')


//handle errors
const handleEroors = (err) => {
    const errors = { email: '', password: '' };
    if (err.code === 11000) {
        errors.email = 'This email already exist';
        return errors;
    }

    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'shhhhh', { expiresIn: maxAge })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = (req, res) => {
    const { email, password } = req.body
    const user = new User({ email, password });

    user.save((err, value) => {
        if (err) {
            const error = handleEroors(err);
            console.log(error);
            res.status(400).json({ "err": error });
        } else {
            const token = createToken(value._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
            res.status(201).json({ user: user._id });
        }
    })
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body

    const login = async (email, password) => {
        const user = await User.findOne({ email });
        if (user) {
            const auth = await bcrypt.compare(password, user.password);
            if (auth) {
                return user;
            }
            throw Error('incorrect password')
        }

        throw Error('incorrect email');
    }

    try {
        const user = await login(email, password); 

        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(200).json({user:user._id});
    }
    catch (err) {
        const error = {email:'', password:''}
        if(err.message.includes('email')){
            error.email = err.message
        }else{
            error.password = err.message
        }
        
        res.status(400).json({err:error })
    }
}  

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/')
}