---
title: Modules
description: Modularise our Apollo Server schema
---
When our schema start to became long and complex one of the technique we have is schema stitching. Apollo team is working really hard to provide a better way to split our schema in multiple files introducing *Modules*.
## Modules
The better way to describe how modules work is giving a small example and explain step by step what to do to implement it.
Let try to build a query that display a list of books with author and a list of Authors:
```js
type Book {
  title: String
  author: Author
}

type Author {
  name: String
  books: [Book]
}
```
### Index.js
As usual we start from our `index.js`:
```js line=4-7
const {ApolloServer} = require('apollo-server');

const server = new ApolloServer({
    modules: [
        require('./modules/author'),
        require('./modules/books')
    ]
})

server
    .listen()
    .then(({url}) => console.log(`server is running at ${url}`));
```
As we can see the main change is the *modules* array that include 2 requires: *author* and *books*.
### Author
Let's create our `./modules/author/index.js`:
```js
const {gql} = require('apollo-server');

const typeDefs = gql`
    extend type Query {
        author(id: ID!): Author
        authors: [Author]
    }

    type Author {
        id: ID!
        name: String
        surname: String
    }
`;

const resolvers = {
    Query: {
        author(_, {id}) {
            return {
                id,
                name: 'Daniele',
                surname: 'Zurico'
            }
        },
        authors() {
            return [
                {
                    id: Math.round(Math.random() * 100000),
                    name: 'Daniele',
                    surname: 'Zurico',
                },
                {
                    id: Math.round(Math.random() * 100000),
                    name: 'Alex',
                    surname: 'Michaels',
                }
            ]
        }
    }
};

module.exports = {
    typeDefs,
    resolvers
}
```
Our author file has no difference with what we already learnt. We created 2 queries:
- list of authors;
- Author given the id.
### Book
Is time to move to `./modules/books/index.js`:

```js line=15-17
const {gql} = require('apollo-server');

const typeDefs = gql`
    extend type Query {
        book(id: ID!): Book
        books: [Book]
    }

    type Book {
        id: ID!
        title: String
        author: Author
    }

    extend type Author {
        books: [Book]
    }
`;

const resolvers = {
    Query: {
        book(_, {id}) {
            return {
                id,
                title: 'test',
                author: {
                        id: Math.round(Math.random() * 100000),
                        name: 'Daniele',
                        surname: 'Zurico'
                    }
            }
        },
        books() {
            return [
                {
                    id: Math.round(Math.random() * 100000),
                    title: 'test',
                    author:{
                        id: Math.round(Math.random() * 100000),
                        name: 'Daniele',
                        surname: 'Zurico'
                    }
                },
                {
                    id: Math.round(Math.random() * 100000),
                    title: 'test2',
                    author: {
                        id: Math.round(Math.random() * 100000),
                        name: 'Alex',
                        surname: 'Michaels'
                    },
                }
            ]
        }
    },
    Author: {
        books() {
            return [{
                id: Math.round(Math.random() * 100000),
                title: 'test',
            }]
        }
    }

};

module.exports = {
    typeDefs,
    resolvers
}
```
Our books contain something more then we probably didn't see before:
```js
extend type Author {
  posts: [Book]
}
```
And this is the glue between our Author and Books that allow us to extend the Author schema introducing the list of Books.
### Test our Server
To explore the newly created GraphQL API, open a browser to the link shown in the console, `http://localhost:4000/`

```js
query {
  books {
    id
    title
    author {
      id
      name
    	surname
    }
  }
}
```

```js
query {
  authors {
    id
    name
    surname
    books {
      id
      title
    }
	}
}
```
### Conclusion
Modules currently lacks support for some things, like custom scalars, but will work for some simple cases, and we plan on expanding the support.

