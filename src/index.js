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
      return response.status(404).json({error: 'User not exists'});
    }
    
    request.user = usernameVadlidation;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExist = users.find(user => user.username === username);

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

    return response.status(201).json(createUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { title, deadline } = request.body;
   const { user } = request;

   const userCreateTodo = {
     id: uuidv4(),
     title,
     done: false,
     deadline: new Date(deadline),
     created_at: new Date()
   }

  user.todos.push(userCreateTodo);

   return response.status(201).json(userCreateTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const verifyIdTodoForAlterInfo = user.todos.find(todo => todo.id === id);
  
  if (!verifyIdTodoForAlterInfo) {
    return response.status(404).json({error: 'Todos does not exist!'});
  }
  
  verifyIdTodoForAlterInfo.title = title;
  verifyIdTodoForAlterInfo.deadline = new Date(deadline);

  return response.status(200).json(verifyIdTodoForAlterInfo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
 

  const verifyIdForAlterFieldDone = user.todos.find(todo => todo.id === id);

  if (!verifyIdForAlterFieldDone){
    return response.status(404).json({error: 'Todos does not exist!'});
  }

  verifyIdForAlterFieldDone.done = true;

  return response.status(200).json(verifyIdForAlterFieldDone);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const verifyIdForDeleteTodo = user.todos.find(todo => todo.id === id);

  if(!verifyIdForDeleteTodo){
    return response.status(404).json({error: 'Todo does not exist!'});
  }

  user.todos.splice(verifyIdForDeleteTodo, 1);

  return response.status(204).json(verifyIdForDeleteTodo);
});

module.exports = app;