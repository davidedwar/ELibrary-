
var express = require('express');
var session = require('express-session');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const { countReset } = require('console');
const { parse } = require('path');


var app = express();

// view engine setup  
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret : 'secret-key',
  resave : false,
  saveUninitialized : false,
}));


const redirectLogin = (req,res,next) =>{
  if(!req.session.UserId) { 
    res.redirect('/');
  }
  else{
     next();
  }
}
const redirectHome = (req,res,next) =>{
  if(req.session.UserId) { 
    res.redirect('/home');
  }
  else{
     next();
  }
}

app.get('/', redirectHome, function(req, res){
  res.render('login', {LoginWarning: ""} );
});

var infoArr = [];
app.post('/register', function(req, res){ 
  var user = req.body.username.toLowerCase();
  var pass = req.body.password;
  var data = fs.readFileSync('UserInfo.json');
  
  
  if(user == '' || pass == ''){
    
    res.render("registration" , {warningmessage: "Username or Password cannot be empty"});
   
  }
else{
  if(data.length==0){
    var input = {"id" : 1, "name": user, "password": pass, "books" : ""};
    infoArr.push(input);
    //CurrentUser = user;
    fs.writeFileSync('UserInfo.json', JSON.stringify(infoArr));
    console.log(req.session.UserId);
    console.log('data 0 ');
    req.session.UserId = 1;
    res.redirect('/home');
    console.log(req.session.UserId);
  }
  else{
  var parsed = JSON.parse(data);
  var count = parsed.length;
  var flag = false;
  var CurrId = parsed.length + 1;
  var input = {"id" : CurrId, "name": user, "password": pass, "books" : ""};
 
  for(i=0;i<count;i++){
    if(parsed[i].name == user){
      flag = true;
    }
  }

  if(flag == false){
    parsed.push(input);
    //CurrentUser = user;
    req.session.UserId = CurrId;
    console.log(parsed);
    console.log(req.session.UserId);
    console.log('false');
    res.redirect('/home');
    console.log(req.session.UserId);
  }
  else{
    if(flag == true){
    //  console.log('this username already exists, please use a differ one');
      res.render('registration', {warningmessage: "This username is already taken, please enter a different one"});
    }

  }
  fs.writeFileSync('UserInfo.json', JSON.stringify(parsed));
}
}

});

app.get('/registration', function(req, res){
  res.render('registration', {warningmessage: ""});
});

console.log(session.UserId);
//Starting from here is only part of the milestone2 functionality
//var Curser = "";rentU
app.post('/', function (req, res){
  var user = req.body.username.toLowerCase();
  var pass = req.body.password;
  var data = fs.readFileSync('UserInfo.JSON');

  if(user == '' || pass == ''){
    res.render("login" , {LoginWarning: "Username or password cannot be empty"});
   
  } 
else{
  if(data.length == 0){
    res.render('login', {LoginWarning: "This username is not registered, please register"});
  }
  else{
  var parsed = JSON.parse(data);
  var UserCorrect = true;
  var PassCorrect = true;
  for(i=0;i<parsed.length;i++){
      if(parsed[i].name== user){
        if(parsed[i].password == pass ){
          exists = true;
          req.session.UserId = parsed[i].id;
          res.redirect('/home');
          console.log(req.session.UserId);
          console.log("trueee");
          return;
        }   
        else{
          PassCorrect = false; 
        }
      }
      else{ 
        UserCorrect = false;
      }
  }
  if(UserCorrect == false){
    res.render('login', {LoginWarning: "This username is not registered, please register"});
  }
  else{
  if(PassCorrect == false){
    res.render('login', {LoginWarning: "You have entered the wrong password, please try again"});
  }}
  }
}
});



app.get('/home', redirectLogin, function(req, res){
  res.render('home');
});

app.get('/novel', redirectLogin, function(req, res){
  res.render('novel');
}); 

app.get('/poetry', redirectLogin, function(req, res){
  res.render('poetry');
});

app.get('/fiction', redirectLogin, function(req, res){
  res.render('fiction');    
});

app.get('/flies', redirectLogin, function(req, res){
  res.render('flies', {error:""});
})

app.get('/grapes', redirectLogin, function(req, res){
  res.render('grapes', {error:""});
})

app.get('/leaves', redirectLogin, function(req, res){
  res.render('leaves', {error:""});
});

app.get('/sun', redirectLogin, function(req, res){
  res.render('sun', {error:""});
});

app.get('/dune', redirectLogin, function(req, res){
  res.render('dune', {error:""});
});


app.post('/search', function(req,res){
  var search = req.body.Search;
  var AllBooks = ['Dune','Lord of the Flies','The Grapes of Wrath','Leaves of grass','To Kill a Mockingbird','The Sun and her Flowers'];
  var SearchedBooks = [];
  for(i=0;i<AllBooks.length;i++){
    if(AllBooks[i].toLowerCase().includes(search.toLowerCase())){   
      SearchedBooks.push(AllBooks[i]);
    }
  }
  
  console.log(SearchedBooks);
  res.render('searchresults', {SearchedBooks:SearchedBooks});   
})

var ListArr = [];
app.post('/list', function(req,res){
     var data = fs.readFileSync('UserInfo.json');
     var book = req.body.BookName
     var parsed = JSON.parse(data);
     var exists = "";
     var i = parsed.findIndex(user => user.id == req.session.UserId);
     console.log(parsed[i]);
     console.log(i);

     if(parsed[i].books.includes(book)){
       console.log('book already exists');
       console.log(book); 
       exists = "book already in readlist";
      //res.redirect('sun');
       switch(book){
         case "Dune":
           res.render('dune', {error:exists});
           break;
         case 'Lord of the Flies':
            res.render('flies', {error:exists});
            break;
         case 'The Grapes of Wrath':
            res.render('grapes', {error:exists});
            break;
         case 'Leaves of grass':
           res.render('leaves', {error:exists});
           break;
         case 'To Kill a Mockingbird':
           res.render('mockingbird', {error:exists});
           break;
         case 'The Sun and her Flowers':
            res.render('sun', {error:exists});
            break;
       }
     }
  else{
    var Pass = parsed[i].password;
    var name = parsed[i].name;
    var ExistingBooks = parsed[i].books;
    console.log(ExistingBooks)
    var ConcatBooks = book + "," + ExistingBooks;
    console.log(ConcatBooks);
    parsed[i] = {id: req.session.UserId, "name" : name, "password" : Pass, "books" : book + "," + ExistingBooks};
    console.log(parsed[i]);
    fs.writeFileSync('UserInfo.json', JSON.stringify(parsed));
    res.redirect('back');
  }
    
    }
)


app.get('/mockingbird', function(req, res){
  res.render('mockingbird',{error:""});
});



  
app.get('/readlist', function(req, res){
  var data = fs.readFileSync('UserInfo.json');
  var parsed = JSON.parse(data);
  var i = parsed.findIndex(user => user.id == req.session.UserId);
       console.log(parsed[i]);
       console.log(i);
  var ExistingBooks = parsed[i].books;
  var BookList = ExistingBooks.split(',')
     console.log(BookList);
     console.log(ExistingBooks)
  var myVar = BookList.length;
  res.render('readlist', {BookList:BookList});
});



if(process.env.PORT){
  app.listen(process.env.PORT, function(){console.log('Server Started')});
}
else{
  app.listen(3000, function() {console.log('Server started on port 3000')});
}
