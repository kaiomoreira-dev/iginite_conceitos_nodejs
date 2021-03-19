const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const usernameVadlidation = users.find(user => 
      user.username === username);

    if(!usernameVadlidation){
      return response.status(404).json({error: 'Username not exists'});
    }
    
    request.user = usernameVadlidation;

    next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExist = users.some(user => user.username === username);

    if(userAlreadyExist){
       return response.status(400).json({error: 'Username already exists'});
    }

    const createUser = {
      name,
      username,
      created_at : new Date(),
      id: uuidv4(),
      todos: []
    }

    users.push(createUser);

    console.log(request.body);

    return response.status(201).json(createUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;

   return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { title, deadline } = request.body;
   const { todos } = request.user;

   const userCreateTodo = {
     id: uuidv4(),
     title,
     done: false,
     deadline: new Date(deadline),
     created_at : new Date()
   }

   todos.push(userCreateTodo);

   return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { todos } = request.user;

  const verifyIdTodoForAlterInfo = todos.find(todo => todo.id === id);
  
  if (!verifyIdTodoForAlterInfo) {
    return response.status(404).json({error: 'Todos does not exist!'});
  }
  
  verifyIdTodoForAlterInfo.title = title;
  verifyIdTodoForAlterInfo.deadline = deadline;

  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const verifyIdForAlterFieldDone = todos.find(todo => todo.id === id);

  if (!verifyIdForAlterFieldDone){
    return response.status(404).json({error: 'Todos does not exist!'});
  }

  verifyIdForAlterFieldDone.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { todos } = request.user;

  const verifyIdForDeleteTodo = todos.find(todo => todo.id === id);

  if(!verifyIdForDeleteTodo){
    return response.status(404).json({error: 'Todo does not exist!'});
  }

  todos.splice(verifyIdForDeleteTodo, 1);

  return response.status(204).send();
});

module.exports = app;