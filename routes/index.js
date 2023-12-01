var express = require('express');
var router = express.Router();

const User = require("../models/userModel");
const Expense = require("../models/expenseModel")
const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(User.authenticate()));

const nodemailer = require('nodemailer')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {admin: req.user});
});

router.get('/register', function(req, res, next) {
  res.render('index', {admin: req.user});
});

router.post('/register', async function(req, res, next) {

  try {
    await User.register(
        { username: req.body.username, email: req.body.email },
        req.body.password
    );
    res.redirect("/login");
   } catch (error) {
    console.log(error);
    res.send(error);
   }

});

router.get('/login', function(req, res, next) {
  res.render('login', {admin: req.user});
});

router.post('/login',
passport.authenticate("local",{
  successRedirect: "/home",
  failureRedirect: "/login",
}),
 function(req, res, next) {

});





// forget password

router.get('/forget', function(req, res, next) {
  res.render('forget', {admin: req.user});
});

router.post('/sendmail', async function(req, res, next) {
  try{
    const user = await User.findOne({
      email: req.body.email
    })
    if(!user) return res.send("user not found")
    

    sendmail(req, res, user)
  }
  catch(error){
    console.log(error)
    res.send(error)
  }
});

function sendmail(req, res, user) {

  const otp = Math.floor(1000 + Math.random() * 9000);

  // admin mail address, which is going to be the sender
  const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
          user: "tarunkoshti910@gmail.com",
          pass: "thgetnhmtzglfkbm",
      },
  });

  // receiver mailing info
  const mailOptions = {
      from: "Dhanesh Pvt. Ltd.<tarunkoshti910@gmail.com>",
      to: user.email,
      subject: "Reset Password",
      // text: "Do not share this link to anyone.",
      html: `<h1>${otp}</h1>`,
  };

  // actual object which intregrate all info and send mail
  transport.sendMail(mailOptions, (err, info) => {
      if (err) return res.send(err);
      console.log(info);

      user.resetPasswordOtp = otp;
      user.save();
      res.render("otp",{admin: req.user, email: user.email})

  //     return res.send(
  //         "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
  //     );
    });
}

router.post("/match-otp/:email", async function(req, res, next){
  try{
    const user = await User.findOne({ email: req.params.email});

    if(user.resetPasswordOtp == req.body.otp){
      user.resetPasswordOtp = -1;
      await user.save();
      res.render("newpassword", {admin:req.user , id: user._id})
    }
    else {
      res.send(
          "Invalid OTP, Try Again <a href='/forget'>Forget Password</a>"
      );
  }
  }
  catch (error) {
    res.send(error);
}
})

router.post("/newpassword/:id", async function (req, res, next) {
  try {
      const user = await User.findById(req.params.id);
      await user.setPassword(req.body.password);
      await user.save();
      res.redirect("/login");
  } catch (error) {
      res.send(error);
  }
});


// after login

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.redirect("/login");
  }
}

// router.get("/home", isLoggedIn, async function(req, res, next){
  
//   try
//   {
//     const currentUser = await User.findOne({_id: req.user._id}).populate("expenses")
//     res.render("homepage", { admin: req.user, user: currentUser });
//   }
//   catch(err){
//     res.send(err)
//   }
// })

router.get("/home", isLoggedIn, async function(req, res, next){

  try{
    const currentUser = await User.findOne({_id: req.user._id}).populate("expenses");
    // console.log(currentUser)
    res.render("homepage", {admin: req.user, user:currentUser})
    
  }
  catch(error){
    res.send(error)
  }
  
})

router.get("/addexpense", isLoggedIn, function(req, res, next){
  
  res.render("addexpense",{admin: req.user})
})

router.post("/addexpense", isLoggedIn, async function(req, res, next){
  
  try{
    const expense = new Expense(req.body)
    req.user.expenses.push(expense._id);
    expense.user = req.user._id ;

    await expense.save();
    await req.user.save();
    // res.json(expense)
    res.redirect("/home")

  }
  catch(error){
    res.send(error)
  }
})


// category

router.get("/category", isLoggedIn , function(req, res, next){
  res.render("category", {admin: req.user,})
})

router.get("/transaction", isLoggedIn , async function(req, res, next){

  try{
    const currentUser = await User.findOne({_id: req.user._id}).populate("expenses");
    // console.log(currentUser)
    res.render("transaction", {admin: req.user, user:currentUser })
  }
  catch(error){
    res.send(error)
  }
  // res.render("transaction")
})

router.get("/edit/:id", isLoggedIn , async function(req, res, next){
  try{
    const expense = await Expense.findById(req.params.id)
    res.render("edit", {admin: req.user,expense})
  }
  catch(error)
  {
    res.send(error)
  }
})

router.post("/edit/:id", isLoggedIn , async function(req, res, next){
  try{
    const expense = await Expense.findByIdAndUpdate(req.params.id,req.body)
    res.redirect("/transaction")
  }
  catch(error)
  {
    res.send(error)
  }
})

router.get("/delete/:id", isLoggedIn , async function(req, res, next){
  try{
    const expense = await Expense.findByIdAndDelete(req.params.id)
    res.redirect("/transaction")
  }
  catch(error)
  {
    res.send(error)
  }
})

// logout

router.get("/logout", isLoggedIn, function(req, res, next){
  req.logout(() => {
    res.redirect("/login");
});
})

//reset

router.get("/reset", isLoggedIn, function (req, res, next) {
  res.render("reset", { admin: req.user });
});

router.post("/reset", isLoggedIn, async function (req, res, next) {
  try {
      await req.user.changePassword(
          req.body.oldpassword,
          req.body.newpassword
      );
      await req.user.save();
      res.redirect("/home");
  } catch (error) {
      res.send(error);
  }
});

// search transaction

router.get("/search", isLoggedIn, async function (req, res, next) {
  try{
    let {expenses} = await req.user.populate("expenses");
    expenses = expenses.filter((e)=> e[req.query.key] == req.query.value)
    console.log(req.query.key)
    console.log(expenses)
    res.render("search",{admin: req.user, expense:expenses})
  }
  catch(error){
    res.send(error)
  }
});

module.exports = router;
