
// init project
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// init sqlite db
var fs = require('fs');
var mysql = require('mysql');
const jwt = require('jsonwebtoken');


let knex=require('knex')({
    client:'mysql',
    connection:{
    'host':'localhost',
    'user':'root',
    'password':'jagan@jagan',
    'database':'blog_db'
    }
});
// creating table for storing blog data;
knex.schema.hasTable('blogs').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('blogs', function(t) {
        t.increments('id').primary();
        t.string('title');
        t.text('blog');
        t.text('imglink');
      });
    }
  });
// creating table for storing signup detail;

knex.schema.hasTable('userdetail').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('userdetail', function(t) {
        t.increments('id').primary();
        t.string('fullname');
        t.text('email');
        t.text('password');
      });
    }
  });

// get the create-blog.html page
app.get('/create-blog',(req,res)=>{
  res.sendFile(__dirname+'/views/create-blog.html')
})

// get the signup page;
app.get('/signup',(req,res)=>{
  res.sendFile(__dirname+'/views/signup.html')
})
// get the signin page;
app.get('/signin',(req,res)=>{
  res.sendFile(__dirname+'/views/signin.html')
})
// -----------------------------------------------------------------------------------------
// // // storing signup data into database separated by user id using post method;         |
// -----------------------------------------------------------------------------------------
app.post('/signin',(req,res)=>{
  var fullname = req.body.fullname;
  var Email = req.body.email;
  var password = req.body.password;
  var data = {fullname:fullname, email:Email, password:password}
// checking for existance of user detail in database
  knex.select('email').from('userdetail').where('email'+'='+Email)
  .then((data)=>{
    res.sendFile(__dirname+"/views/signin.html")
  })
  .catch((err)=>{
    knex('userdetail').insert(data)
    .then((data1) => {
        console.log('data inserted')
        res.sendFile(__dirname+'/views/signin.html')
    })
    .catch((err)=>{
      console.log('err in inserting data')
      res.sendFile(__dirname+'/views/sigup.html')
    })
  })
});
  
// getting singin data and checking the existance in database;
app.post('/login',(req,res)=>{
  var Email = req.body.email;
  var Password = req.body.password;
  knex.select('*').from('userdetail').where('email',Email)
  .then((data) => {
    // console.log(data)
    if (data[0].password==Password && data[0].email==Email){
      console.log("login successfull")
       res.sendFile(__dirname+'/views/home.html')
      }else{
        console.log('This email id did not exists')
        res.sendFile(__dirname+'/views/signin.html')
      }

    })
  .catch((err) => {
    console.log('This email id did not exists')
    res.sendFile(__dirname+'/views/signin.html')
  });
}); 


// inserting data into the table;

app.post('/home',(req,res)=>{
  var title = req.body.title;
  var text = req.body.text;
  var imglink = req.body.imglink;
  const data = [{title:title,blog:text, imglink:imglink}];
  knex('blogs').insert(data)
  .then(() => {
      res.redirect('/show')
          
      })
  .catch((err) => { console.log(err); throw err })
});

// display blogs into html page

app.get("/show",(req,res)=>{
	knex.select("*").from("blogs")
	.then((data)=>{
		if (data.length>0){
			fs.readFile("views/index.html",(err,fdata)=>{
				let file=fdata.toString('utf8').split("\n");
				var ia="";
				for(i of file){
					ia+=i
					if (i.includes('class="data"')){
						for (j of data){
							// console.log(data)
							ia+="<div class='box'><h2>"+j.title+"</h2><p>"+j.blog+"</p><img style='width: 200px;height:200px;' src ="+j.imglink+"></div>"
						}
					}
				}
				fs.writeFile("views/home.html",ia,(err,data)=>{
					res.sendFile(__dirname+"/views/home.html")
				})
				// console.log(ia);
				
			})
			// res.sendFile(__dirname+"/home.html")
		}else{
			res.send({"name":"there is no blogs"})
		}
	})
	.catch(()=>{
		res.send("there is no table...")
	})
})


// listen for requests :)
var listener = app.listen(8000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
