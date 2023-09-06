const express = require('express')
const app = express()
const PORT = 5000
const axios = require('axios')
const users = require('../data/db.json')
const jwt = require('jsonwebtoken')
const secret = 'mern2023'
const cookies = require('cookie-parser')
const multer = require('multer')

app.use(cookies())
app.use(express.static('uploads'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine','ejs')

app.get('/login',(req,res)=>{
    res.render('login')
})

//Configuration for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    }
    // filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    // }
  })
  
  const upload = multer({ storage: storage })




const logger =(req,res,next)=>{
    const token = req.cookies.token_auth
    if(!token){
        return res.redirect('/register')
    }
    const decoded = jwt.verify(token,secret)
    const {email,image } = decoded
    req.email = email
    req.image = image
    next()
}

app.post('/login',(req,res)=>{
    const {email,password} = req.body
    const user = users.users.find(u=>u.email==email)
    if(!user){
        return res.send('user not found')
    }
    if(!(user.password == password)){
        return res.send('password incorrect')
    }
    const token = jwt.sign({email:email,image:user.image},secret)
   res.cookie('token_auth',token)
   res.redirect('/dashboard')
    
    

})


app.get('/register',(req,res)=>{
    res.render('register')
})

app.post('/register',upload.single('image'),(req,res)=>{
    const {username,password,email} = req.body
    const image = req.file
    console.log(image)
    axios.post('http://localhost:3100/users',{username:username,password:password,email:email,image:image.filename})
    res.redirect('/login')
})

app.get('/dashboard',logger,(req,res)=>{
    res.render('dashbord',{email:req.email,image:req.image})
})






app.listen(PORT,()=>{
    console.log('port 5000')
})
