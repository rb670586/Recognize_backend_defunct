const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'Ryan!219',
    database : 'recognize'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors())

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db.select('*').from('users')
					.where('email', '=', req.body.email)
					.then(user => {
						res.json(user[0])						
					})
					.catch(err => res.status(400).json('unable to get user'))
			} else {
			res.status(400).json('wrong credentials')				
			}

		})
		.catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body; //email, name, and password are coming from the body of the request when the user posts
	const hash = bcrypt.hashSync(password);
		db.transaction(trx => { //creating a transaction because of the need to do two operations at once. trx is used to perform these transactions
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0],
					name: name,
					joined: new Date()
				})
			.then(user => {
				res.json(user[0]); //when resgistering a user, it returns an array. user[0] returns the first object in the array
			})
		})
			.then(trx.commit)
			.catch(trx.rollback)
		})
		.catch(err => res.status(400).json('unable to register')) //we don't want the user to know what the error exactly is for security reasons
})

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*').from('users').where({id})
	.then(user => {
		if (user.length) { //if the lengh of the array > 1 then return a user. If not, return an error
			res.json(user[0])
		} else {
			res.status(400).json('Not found')
		}		
	})
	.catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => { // '/image' endpoint updates the entries and increases the count
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		response.json(entries[0]);
	})
	.catch(err => response.status(400).json('unable to get entries'))
})


// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

app.listen(3001, () => {
	console.log('app is running on port 3001');
})