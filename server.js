const Express = require('express');
const Sequelize = require('sequelize');
const Crypto = require("crypto");
const graphqlHTTP = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString } = require('graphql');

// SET UP DATABASE

const database = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: './database.sqlite'
});

database.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});

// DEFINE MODELS

const TodoModel = database.define('todo', {
  id: { type: Sequelize.STRING, primaryKey: true },
  message: { type: Sequelize.STRING }
}, { timestamps: false });

// SET UP GRAPHQL SCHEMA

const resolvers = {
  todos() {
    return TodoModel.findAll().then((todos)=> {
      return todos.map((todo)=> {
        return new Todo(todo.id, todo.message)
      });
    });
  },
  
  createTodo(parent, { message }) {
    return TodoModel.create({
      id: Crypto.randomBytes(16).toString("hex"),
      message
    }).then((todo)=> {
      return new Todo(todo.id, todo.message);
    });
  },
  
  destroyTodo(parent, { id }) {
    return TodoModel.findById(id).then((todo)=> {
      return TodoModel.destroy({ where: { id } }).then(()=> {
        return new Todo(id, todo.message);
      });
    });
  }
};

// Define the Todo class

class Todo {
  constructor(id, message) {
    this.id = id;
    this.message = message;
  }
}

// Define the Todo type

const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: {
    id: { type: GraphQLString },
    message: { type: GraphQLString },
  }
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    todos: {
      type: new GraphQLList(TodoType),
      resolve: resolvers.todos
    }
  }
});

const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createTodo: {
      type: TodoType,
      args: {
        message: {
          name: 'message',
          type: GraphQLString
        }
      },
      resolve: resolvers.createTodo
    },
    destroyTodo: {
      type: TodoType,
      args: {
        id: {
          name: 'id',
          type: GraphQLString
        }
      },
      resolve: resolvers.destroyTodo
    }
  }
});

var schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});

// SETUP EXPRESS APP 

const App = Express();

App.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

App.listen(3000);

console.log('Running express server');