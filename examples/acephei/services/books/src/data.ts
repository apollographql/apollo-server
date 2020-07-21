import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

export interface Book {
  isbn: string
  title: string
  year: number | null
  similarBooks?: string[]
}

export class BooksDataSource implements DataSource {
  private loader?: DataLoader<string, Book>;
  initialize() {
    this.loader = new DataLoader((keys: string[]) =>
      Promise.resolve(
        books.filter(({ isbn }) => {
          return keys.indexOf(isbn) > -1;
        })
      )
    );
  } // where you can get access to context and cache
  find(isbn?: string) {
    if (!isbn) throw new Error("Can not find book without isbn")
    return this.loader!.load(isbn);
  }
}

const books = [
  {
    isbn: '0262510871',
    title: 'Structure and Interpretation of Computer Programs',
    year: 1996,
  },
  {
    isbn: '0136291554',
    title: 'Object Oriented Software Construction',
    year: 1997,
  },
  {
    isbn: '0201633612',
    title: 'Design Patterns',
    year: 1995,
    similarBooks: ['0201633612', '0136291554'],
  },
  {
    isbn: '1234567890',
    title: 'The Year Was Null',
    year: null,
  },
  {
    isbn: '404404404',
    title: '',
    year: 404,
  },
  {
    isbn: '0987654321',
    title: 'No Books Like This Book!',
    year: 2019,
  },
];