var express = require('express')
var exphbs  = require('express-handlebars')
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql')
var app = express()

//handlebars
console.log("initialized handlebars")
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//session
app.use(session({
    secret:'helloiajwdfhkolaewihrl',
    resave:true,
    saveUninitialized:false
}));

//database
console.log('initsalized mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
   database: 'pharmaceutical'
})
connection.connect(function(err) {
  if (!err)
	 console.log('You are now connected... to mysql database ')
  else
	console.log(err);
})

//routing
app.get('/', function (req, res) {
		if(req.session.user){
			sql="select m.mname, m.edate, s.sname, c.cname, m.price, m.profit from medicine m, supplier s, company c where m.sid=s.sid and s.cid=c.cid"
			//console.log('sdbcbs')
			connection.query(sql,function(err,rows,fields){
				console.log(fields)
				res.render('home',{rows:rows,fields:fields})
			})
		}
		else
			res.render('home')
		
})
app.get('/available', function (req, res) {
		if(req.session.user){
			sql="select m.mname, m.available from medicine m where m.mname='"+req.query.name+"'"
			console.log(sql)
			connection.query(sql,function(err,rows,fields){
				res.render('available',{rows:rows,fields:fields})
			})
		}
		else
			res.render('available')
		
})
//add mediine page
app.get('/add',function(req,res){
	var x=new Date();
	var dt=x.getDate()+"."+x.getMonth()+"."+x.getFullYear();
	if(req.session.user){
		sql="select m.mname, m.available from medicine m"
		console.log(sql)
		connection.query(sql,function(err,rows,fields){
			res.render('add',{rows:rows,fields:fields,date:dt});
		})
	}
	else
		res.render('available')
})
app.post('/add', function(req,res){
	console.log(req.body.mname);
	console.log(req.body.qty);
	if(req.session.user){
			sql="update medicine set available=available+"+req.body.qty+" where mname='"+req.body.mname+"'"
			sql1="update medicine set edate='"+req.body.edate+"' where mname='"+req.body.mname+"'"
			console.log(sql)
			connection.query(sql,function(err,rows,fields){
				connection.query(sql1,function(err,rows,fields){
				res.redirect('/add');
				})
			})
		}
		else
			res.render('available')
})
//login page
app.get('/login', function (req, res) {
	res.render('login')
})
app.post('/login', function (req, res) {
	sql = "select * from users where username='"+req.body.name+"' and password='"+req.body.pwd+"'"
	connection.query(sql, function(err,rows,fields){
		if(rows.length==0)
			res.send('invalid username or password')
		else{
			req.session.user=rows[0].username;
			res.redirect('/')
		}
			
	})
})
app.get('/about', function (req, res) {
		res.render('about')
})
app.get('/signup', function (req, res) {
		res.render('signup')
})
app.post('/signup', function(req,res){
	if(req.body.pwd==req.body.repwd){
			sql= "insert into users values('"+req.body.name+"','"+req.body.pwd+"','"+req.body.email+"')";
			connection.query(sql,function(err,rows,fields){
				res.redirect('/login')
			})
	}
})
app.get('/delstock', function (req, res) {
	if(req.session.user){
		sql="select m.mname, m.available from medicine m where m.mname='"+req.query.name+"'"
		console.log(sql)
		connection.query(sql,function(err,rows,fields){
			res.render('delstock',{rows:rows,fields:fields})
		})
	}
	else
		res.render('available')
});
app.post('/delstock', function(req,res){
	console.log(req.body.del);
	if(req.session.user){
			sql="update medicine set available=0 where mname='"+req.body.del+"'"
			sql1="update medicine set edate='-' where mname='"+req.body.del+"'"
			console.log(sql)
			connection.query(sql,function(err,rows,fields){
				connection.query(sql1,function(err,rows,fields){
					res.redirect('/delstock?name='+req.body.del);
				})
			})
		}
		else
			res.render('available')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})