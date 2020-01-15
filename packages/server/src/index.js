import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import path from 'path';
// import { knex } from './database'

import {
  typeDefs,
  resolvers,
  dataLoaders,
  directives
} from "./graphql";

// console.log('knex', knex)

const app = express();
let port;
if (!process.env.PORT) {
    port = 5000;
} else {
    port = process.env.PORT
}

// const books = [
//     {
//         title: 'Harry Potter and the Chamber of Secrets',
//         author: 'J.K. Rowling',
//     },
//     {
//         title: 'Jurassic Park',
//         author: 'Michael Crichton',
//     },
// ];

// const typeDefs = gql`

//   type Book {
//     title: String
//     author: String
//   }

//   type Query {
//     books: [Book]
//   }
// `;

// const resolvers = {
//     Query: {
//         books: () => books,
//     },
// };

const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataLoaders,
    directives,
    context: async args => {
      return {
        user: {
          userName: "Mike"
        }
      }
    }
});

server.applyMiddleware({ app })

// app.get('/hello', (req, res) => res.send('Hello World!'))


// Serving react client
if (process.env.NODE_ENV === 'production') {

    app.use(express.static(path.join(__dirname, '../../client/build')));

    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))