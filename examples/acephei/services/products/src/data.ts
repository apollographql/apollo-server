import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

export interface Product {
  upc?: string;
  sku?: string;
  isbn?: string;
  name?: string;
  title?: string;
  year?: number;
  price: number;
  weight?: number;
}

export class ProductsDataSource implements DataSource {
  private loader?: DataLoader<string, Product>;
  initialize() {
    this.loader = new DataLoader((keys: string[]) =>
      Promise.resolve(
        products.filter(({ upc, sku, __typename, isbn }) => {
          if (__typename === "Book" && isbn) {
            return keys.indexOf(isbn) > -1
          }
          if (upc || sku) {
            return keys.indexOf(upc!) > -1 || keys.indexOf(sku!) > -1;
          }
          throw new Error('unique identifier not passed into loader')
        })
      )
    );
  } // where you can get access to context and cache
  find(upc?: string) {
    if (!upc) throw new Error("Can not find product without upc");
    return this.loader!.load(upc);
  }
  findMany({ first }: { first: number }) {
    return products.slice(0, first);
  }
}

const products = [
  {
    __typename: 'Furniture',
    upc: '1',
    sku: 'TABLE1',
    name: 'Table',
    price: 899,
    brand: {
      __typename: 'Ikea',
      asile: 10,
    },
  },
  {
    __typename: 'Furniture',
    upc: '2',
    sku: 'COUCH1',
    name: 'Couch',
    price: 1299,
    brand: {
      __typename: 'Amazon',
      referrer: 'https://canopy.co',
    },
  },
  {
    __typename: 'Furniture',
    upc: '3',
    sku: 'CHAIR1',
    name: 'Chair',
    price: 54,
    brand: {
      __typename: 'Ikea',
      asile: 10,
    },
  },
  { __typename: 'Book', isbn: '0262510871', price: 39 },
  { __typename: 'Book', isbn: '0136291554', price: 29 },
  { __typename: 'Book', isbn: '0201633612', price: 49 },
  { __typename: 'Book', isbn: '1234567890', price: 59 },
  { __typename: 'Book', isbn: '404404404', price: 0 },
  { __typename: 'Book', isbn: '0987654321', price: 29 },
];
