const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/hashing', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})

app.set('view engine', 'ejs');
app.set('views','views');
app.use(express.urlencoded({extended: true}));
app.use(session({secret: '12345678', resave: true}));

app.get('/', (req, res)=>{
    res.send("Welcome")
})
app.get('/register', (req, res)=>{
    res.render('register')
})
app.post('/register', async(req, res)=>{
    const {username, password} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})
app.get('/login', (req,res)=>{
    res.render('login');

})
app.post('/login', async(req,res)=>{
    const { username, password } = req.body;
    const user = await User.findOne({username});
    const validUser = await bcrypt.compare(password, user.password);
    if(validUser){
        req.session.user_id = user._id;
        res.redirect('/secret')
    }else{
        res.redirect('/login')
    }
})
app.post('/logout', (req,res)=>{
    req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})
app.get('/secret', (req, res)=>{
    if(!req.session.user_id){
       return res.redirect('/')
    }
    res.render('secret');
})

app.listen(3000, ()=>{
    console.log('listening');
})

