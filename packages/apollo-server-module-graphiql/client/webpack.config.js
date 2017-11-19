/* eslint-env node */
`use strict`;

const path = require(`path`);
const { ContextReplacementPlugin, DefinePlugin, optimize: { UglifyJsPlugin } } = require(`webpack`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);

module.exports = {
  entry: path.join(__dirname, `src/index.tsx`),
  output: {
    path: path.resolve(__dirname, `../dist/public`),
    filename: `bundle.js`
  },
  resolve: {
    extensions: [`.ts`, `.tsx`, `.js`, `.json`]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: `ts-loader`
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: `style-loader`,
          use: `css-loader`
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin(`styles.css`),
    new ContextReplacementPlugin(/graphql-language-service-interface[/\\]dist/, new RegExp(`^\\./.*\\.js$`)),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    ...(process.env.NODE_ENV === `production` ? [new UglifyJsPlugin()] : [])
  ]
};
