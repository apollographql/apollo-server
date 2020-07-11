import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

export interface User {
  id: string;
  username?: string;
}

export interface Review {
  id: string;
  authorID: string;
  product: Product;
  body: string;
}

export interface Product {
  __typename: string;
  upc?: string;
  isbn?: string
  similarBooks?: string[]
}

export class ReviewsDataSource implements DataSource {
  private loader?: DataLoader<string, Review>;
  initialize() {
    this.loader = new DataLoader((keys: string[]) =>
      Promise.resolve(
        reviews.filter(({ id }) => {
          return keys.indexOf(id) > -1;
        })
      )
    );
  } // where you can get access to context and cache
  find(id: string) {
    return this.loader!.load(id);
  }
  findByAuthor(id: string) {
    return reviews.filter(review => review.authorID === id);
  }
  findByProduct(upc: string) {
    return reviews.filter(review => {
      return review.product.upc === upc || review.product.isbn === upc
    });
  }
}

export class UsersDataSource implements DataSource {
  private loader?: DataLoader<string, User>;
  initialize() {
    this.loader = new DataLoader((keys: string[]) =>
      Promise.resolve(
        users.filter(({ id }) => {
          return keys.indexOf(id) > -1;
        })
      )
    );
  } // where you can get access to context and cache
  find(id?: string) {
    if (!id) throw new Error("Can not find user without id");
    return this.loader!.load(id);
  }
}

const users: User[] = [
  { id: "1", username: "@ada" },
  { id: "2", username: "@complete" }
];

const reviews: Review[] = [
  {
    id: '1',
    authorID: '1',
    product: { __typename: 'Furniture', upc: '1' },
    body: 'Love it!',
  },
  {
    id: '2',
    authorID: '1',
    product: { __typename: 'Furniture', upc: '2' },
    body: 'Too expensive.',
  },
  {
    id: '3',
    authorID: '2',
    product: { __typename: 'Furniture', upc: '3' },
    body: 'Could be better.',
  },
  {
    id: '4',
    authorID: '2',
    product: { __typename: 'Furniture', upc: '1' },
    body: 'Prefer something else.',
  },
  {
    id: '4',
    authorID: '2',
    product: { __typename: 'Book', isbn: '0262510871' },
    body: 'Wish I had read this before.',
  },
  {
    id: '5',
    authorID: '2',
    product: { __typename: 'Book', isbn: '0136291554' },
    body: 'A bit outdated.',
  },
  {
    id: '6',
    authorID: '1',
    product: { __typename: 'Book', isbn: '0201633612' },
    body: 'A classic.',
  },
];
