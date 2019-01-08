const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cons = require('consolidate'),
      dust = require('dustjs-helpers'),
      mysql = require('mysql');

require('dotenv').config();
const app = express();

// Connect to DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE
});

// Set Dust engine to .dust files
app.engine('dust', cons.dust);
// Set .dust as default extension
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  db.query('SELECT * FROM recipes', (err, result) => {
    if (err) throw err;
    res.render('index', { recipes: result.map(x => x) });
  });
});

app.post('/add', (req, res) => {
  const post = {
    name: req.body.name,
    ingrediants: req.body.ingrediants,
    directions: req.body.directions
  };

  db.query('INSERT INTO recipes SET ?', post, (err, result) => {
    res.redirect('/');
  });
});

app.post('/edit', (req, res) => {
  const {name, ingrediants, directions, id} = req.body;

  db.query(`UPDATE recipes SET name = ?, ingrediants = ?, directions = ? WHERE id = ?`,
  [name, ingrediants, directions, id],
  (err, result) => {
    res.redirect('/');
  })
});

app.delete('/delete/:id', (req, res) => {
  db.query(`DELETE FROM recipes WHERE id=${req.params.id}`, (err, result) => {
    res.sendStatus(200);
  });
});

app.listen(5000, () => console.log('Server has started on port 5000'));