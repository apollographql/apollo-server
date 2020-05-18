import * as accounts from './accounts';
import * as books from './books';
import * as documents from './documents';
import * as inventory from './inventory';
import * as product from './product';
import * as reviews from './reviews';
import * as shipping from './shipping';

export {
  accounts,
  books,
  documents,
  inventory,
  product,
  reviews,
  shipping,
};

export const fixtures = [
  accounts,
  books,
  documents,
  inventory,
  product,
  reviews,
  shipping,
];

export const fixtureNames = [
  accounts.name,
  product.name,
  inventory.name,
  reviews.name,
  books.name,
  documents.name,
  shipping.name,
];
