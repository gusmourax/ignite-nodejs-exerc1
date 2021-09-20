const express = require('express');
const cors = require('cors');

const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;	

	const user = users.find((user) => user.username === username);

	if(!user) return response.status(400).send({error: 'User not exists.'})

	request.user = user;
	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const userAlreadyExists = users.some(user => user.username === username);

	if(userAlreadyExists) return response.status(400).send({ error: 'User already exists.' });

	const user = {
		id: v4(),
		name,
		username,
		todos: [],	
	}

	users.push(user);
	return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	return response.status(200).send(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { deadline, title } = request.body;
	const { user } = request;
	
	const todo = {
		id: v4(),
		title: title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	};
	
	user.todos.push(todo);

	return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { deadline, title } = request.body;
	const { user } = request;

	const todoIndex = user.todos.findIndex(todo => todo.id === id);

	if(todoIndex === -1) return response.status(404).send({ error: 'Todo not exists.' });

	user.todos[todoIndex].deadline = new Date(deadline);
	user.todos[todoIndex].title = title;

	return response.status(200).send(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	
	const todoIndex = user.todos.findIndex(todo => todo.id === id);

	if(todoIndex === -1) return response.status(404).send({ error: 'Todo not exists.' });

	user.todos[todoIndex].done = true;

	return response.status(200).send(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;

	const todoIndex = user.todos.findIndex(todo => todo.id === id);

	if(todoIndex === -1) return response.status(404).send({ error: 'Todo not exists.' });

	user.todos.splice(todoIndex, 1);
	
	return response.status(204).send();
});

module.exports = app;
