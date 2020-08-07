import { DataSource } from "apollo-datasource";
import DataLoader from "dataloader";

export interface User {
  id: string;
  username: string;
  birthDate: string;
  name: string;
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
    if (!id) throw new Error("Can not find user without id")
    return this.loader!.load(id);
  }
}

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
];
