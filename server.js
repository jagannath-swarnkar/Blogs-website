
// init project
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
const jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
del = function(req, res) { res.clearCookie('login_token'); res.redirect('/signin'); }




// init sqlite db
var fs = require('fs');
var mysql = require('mysql');


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
        t.string('email');
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

/*
__________________________________________________________________________________________________________________________________
|                                          ALL GET METHODS TO DISPLAY PAGES ON BROWSER                                                    |
-----------------------------------------------------------------------------------------------------------------------------------
*/
//logout
app.get('/logout',del=>{
  // cookie = req.cookies;
  // for (var prop in cookie){
  //   if(!cookie.hasOwnProperty(prop)){
  //   continue;
  //   }
  // cookie.set('testtoken', {maxAge: Date.now()});
    // res.cookie(prop, '', {exprires: new Date(0)});
  // }
})


// get the create-blog.html page
app.get('/create-blog',(req,res)=>{
  // verifyToken(req,res)
  res.sendFile(__dirname+'/views/create-blog.html')
})
// get home page
app.get('/',(req,res)=>{
  verifyToken(req,res)
})
// get home page
app.get('/home',(req,res)=>{
  verifyToken(req,res)
})
// get the signup page;

app.get('/signup',(req,res)=>{
  res.sendFile(__dirname+'/views/signup.html')
})
// get the signin page;
app.get('/signin',(req,res)=>{
  res.sendFile(__dirname+'/views/signin.html')
})

// profile page 
app.get('/myblogs',(req,res)=>{
  var token=(req.headers.cookie);
  if(token !== undefined){
    var newtoken = token.split(' ')
    newtoken = newtoken[newtoken.length-1].split('=')[0]
    if (token){
      jwt.verify(newtoken, 'lala', (err,decoded)=>{
        if(err){
          res.redirect('/signin')
        }
          knex.select('*').from('blogs').where('email',decoded.email).then((data)=>{
            var titlelist=[];
            var imglist = []
            var bloglist = []
            for(var i of data){
              titlelist.push(i.title);
              imglist.push(i.imglink);
              bloglist.push(i.blog)
            }
            res.render(__dirname+'/views/myblogs.ejs',{titlelist:titlelist, imglist:imglist, bloglist:bloglist})
          });
      })
    }else{
      res.redirect('/signin')
    }
  }else{
    res.redirect('/signin')
  }
})


/*
__________________________________________________________________________________________________________________________________
|                                           ALL POST METHODS                                                    |
-----------------------------------------------------------------------------------------------------------------------------------
*/

// // // storing signup data into database separated by user id using post method;         |
//------------------------------------------------------------------------------------------

app.post('/signin',(req,res)=>{
  var fullname = req.body.fullname;
  var Email = req.body.email;
  var password = req.body.password;
  var data = {fullname:fullname, email:Email, password:password}
// checking for existance of user detail in database
knex.select('*').from('userdetail').where('email',Email)
  .then((data1)=>{
    if(data1.length>0){
      res.sendFile(__dirname+"/views/signin.html")
      }else{
        knex('userdetail').insert(data)
        .then((data1) => {
          createUserTable()
            console.log('data inserted')
            res.sendFile(__dirname+'/views/signin.html')
        });
      }
  })
  .catch((err)=>{
    console.log('it is not working')
    knex('userdetail').insert(data)
    .then((data1) => {
      userTable(data.email)
        console.log('data inserted')
        res.sendFile(__dirname+'/views/signin.html')
    })
    .catch((err)=>{
      console.log('err in inserting data')
      res.sendFile(__dirname+'/views/sigup.html')
    })
  })
});3



// getting singin data and checking the existance in database;
//--------------------------------------------------------------

app.post('/login',(req,res)=>{
  var Email = req.body.email;
  var Password = req.body.password;
  knex.select('*').from('userdetail').where('email',Email)
  .then((data) => {
    // console.log(data)
    if (data[0].password==Password && data[0].email==Email){
        console.log("login successfull")
        var token = jwt.sign(req.body,'lala',{expiresIn:"120s"})
        res.cookie('bearer '+token,{overwrite:true})
        console.log('token generated and send to the cookie successfully')
        
       res.sendFile(__dirname+'/views/home.html')
      }else{
        console.log('This email id did not exists')
        res.sendFile(__dirname+'/views/signin.html')
      }

    })
  .catch((err) => {
    console.log('This email id did not exists')
    res.sendFile(__dirname+'/views/signup.html')
  });
}); 


// inserting data into the table from the create_blog page;
//-----------------------------------------------------------

app.post('/home',(req,res)=>{
  var title = req.body.title;
  var text = req.body.text;
  var imglink = req.body.imglink;
  var email;
  var token=(req.headers.cookie);
  var newtoken = token.split(' ')
  newtoken = newtoken[newtoken.length-1].split('=')[0]
  jwt.verify(newtoken, 'lala', (err,decoded)=>{
    email = decoded.email;
    console.log('email printing : ',email)
  })

  const data = [{title:title,blog:text, imglink:imglink, email:email}];
  knex('blogs').insert(data)
  .then(() => {
      res.redirect('/show')
          
      })
  .catch((err) => { console.log(err); throw err })

});

// display blogs into html page
//--------------------------------

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
	.catch((err)=>{
    console.log(err)
		res.send("there is no table...")
	})
})

/*
__________________________________________________________________________________________________________________________________
|                                           SOME FUNCTIONS USED IN THIS PROGRAMME                                                   |
-----------------------------------------------------------------------------------------------------------------------------------
*/

// fetching the email id of each user to create table 
//-----------------------------------------------------
function createUserTable(){
  knex.select('*').from('userdetail')
    .then((data)=>{
      for(var i of data){
        userTable(i.email.split('@')[0]+i.password)
        // console.log(i.fullname+i.id)

      }
    })
  }

// creating table per particular user with username
//---------------------------------------------------------------
function userTable(tableName){
  knex.schema.hasTable(tableName).then(function(exists){
    if(!exists){
      return knex.schema.createTable(tableName, function(table){
        table.increments('id').primary;
        table.text('title');
        table.text('blog');
        table.text('imglink');
      });
    }
  })
};


//                   Verify the user login usign token                                              
//-------------------------------------------------------------------------------------------------

function verifyToken(req,res,next){
  var token=(req.headers.cookie);
  if(token !== undefined){
    var newtoken = token.split(' ')
    newtoken = newtoken[newtoken.length-1].split('=')[0]
    if (token){
      jwt.verify(newtoken, 'lala', (err,decoded)=>{
        console.log('err:  ' ,err)
        console.log('decode :  ',decoded)
        if(err){
          console.log(decoded)
          res.redirect('/signin')
        }else{
          res.sendFile(__dirname+'/views/home.html')
        }
      })
    }else{
      res.redirect('/signin')
    }
  }else{
    console.log('uff')
    res.redirect('/signin')
  }
}





/*
__________________________________________________________________________________________________________________________________
|                                           storing data of particular user by user email id                                       |
-----------------------------------------------------------------------------------------------------------------------------------
*/





// listen for requests :)
var listener = app.listen(8000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
