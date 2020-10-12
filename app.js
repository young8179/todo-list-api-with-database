const express = require('express');
const bodyParser = require('body-parser');
const db = require("./models")
const es6Renderer = require('express-es6-template-engine');
const bcrypt = require("bcrypt")

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(express.static('./public'));

app.get("/register", (req,res)=>{
  res.render("register", {
    locals: {
      error: null
    }
  })
})

app.post("/register", (req, res)=>{
  //check if post was submitted with email and password
  if(!req.body.email || !req.body.password){
    res.render("register", {
      locals: {
        error: "please submit all required fields"
      }
    })
    return;
  }
  const { email, password } = req.body
  bcrypt.hash(password, 10, (err, hash)=>{
    db.User.create({
      email: email,
      password: hash
    })
      .then((user)=>{
        res.redirect("/login")
      })
  })

})

app.get("/login", (req, res)=>{
  res.render("login", {
    locals: {
      error: null
    }
  })
})

app.post("/login", (req, res)=>{
  if(!req.body.email || !req.body.password){
    res.render("login", {
      locals: {
        error: "please submit all required fields"
      }
    })
    return;
  }
  db.User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then((user)=>{
      if(!user){
        res.render("login", {
          locals: {
            error: "no user with That email"
          }
        })
        return;
      }
      bcrypt.compare(req.body.password, user.password, (err, matched)=>{
        if(matched){
          res.send("YOU LOGGED IN")
        }else{
          res.send("NOPE, WRONG PASSWORD")
        }
      })
    })
})

// GET /api/todos
app.get('/api/todos', (req, res) => {
  db.Todo.findAll()
    .then((todos)=>{
      res.json(todos)
    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })
});

// GET /api/todos/:id
app.get('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.Todo.findByPk(id)
    .then((todo)=>{
      if(!todo){
        res.status(404).json({ error: `Could not find Todo with id: ${id}`})
        return;
      }
      res.json(todo)
    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })

});

// POST /api/todos
app.post('/api/todos', (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).json({
      error: 'Provide todo text',
    });
    return;
  }
  
  db.Todo.create({
    name: req.body.name
  })
    .then((newTodo)=>{
      res.json(newTodo);

    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })

});

// PUT /api/todos/:id   update~!!!!
app.put('/api/todos/:id', (req, res) => {
  if (!req.body || !req.body.name) {
    res.status(400).json({
      error: 'Provide todo text',
    });
    return;
  }
  const { id } = req.params
  db.Todo.findByPk(id)
    .then((todo)=>{
      if(!todo){
        res.status(404).json({ error: `Could not find Todo with id: ${id}`})
        return;
      }
      todo.name = req.body.name;
      todo.save();
      res.json(todo);
    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', (req, res) => {
  db.Todo.destroy({
    where: {
      id: req.params.id
    }
  })
    .then((deleted)=>{
      if(deleted === 0){
        res.status(404).json({ error: `Could not find Todo with id: ${id}`})
        return;
      }
      res.status(204).json()
    })
    .catch((error)=>{
      console.error(error)
      res.status(500).json({ error:`A Database Error Occurred` })
    })
});

app.listen(3000, function () {
  console.log('Todo List API is now listening on port 3000...');
});
