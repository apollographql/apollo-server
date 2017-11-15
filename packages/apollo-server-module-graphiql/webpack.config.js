/* eslint-env node */
`use strict`;

const path = require(`path`);
const { ContextReplacementPlugin, DefinePlugin, optimize: { UglifyJsPlugin } } = require(`webpack`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);

module.exports = {
  entry: path.join(__dirname, `src/client/index.js`),
  output: {
    path: path.resolve(__dirname, `dist/public`),
    filename: `bundle.js`
  },
  module: {
    rules: [
      {
        loader: `babel-loader`,
        exclude: /node_modules/,
        options: {
          presets: [`react`, [`env`, { modules: false }]]
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new ContextReplacementPlugin(/graphql-language-service-interface[/\\]dist/, new RegExp(`^\\./.*\\.js$`)),
    new DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new UglifyJsPlugin()
  ]
};
