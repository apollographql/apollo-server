import gql from 'graphql-tag';

export const name = 'documents';
export const url = `https://${name}.api.com`;
export const typeDefs = gql`
  directive @stream on FIELD
  directive @transform(from: String!) on FIELD

  extend type Query {
    body: Body!
  }

  union Body = Image | Text

  type Image {
      name: String!
      # Same as option below but the type is different
      attributes: ImageAttributes!
  }

  type Text {
      name: String!
      # Same as option above but the type is different
      attributes: TextAttributes!
  }

  type ImageAttributes {
    url: String!
  }

  type TextAttributes {
    bold: Boolean
    text: String
  }
`;
