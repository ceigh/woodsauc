'use strict';

import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const WEBPACK_MODE = process.env.WEBPACK_MODE || 'development';
const dev = WEBPACK_MODE === 'development';

export default {
  mode: WEBPACK_MODE,

  context: `${__dirname}/assets/js`,

  entry: {
    index: './index',
    preloader: './preloader'
  },

  output: {
    library: 'woodsauc',
    publicPath: '/static/build/',
    path: `${__dirname}/src/auction/static/build`,
    filename: dev ?
              'js/[name].js' :
              'js/[name].min.js'
  },

  watch: dev,
  watchOptions: { aggregateTimeout: 100 },

  devtool: dev ? 'eval' : '(none)',

  optimization: {
    minimizer: dev ?
               [ () => {} ] :
               [ new UglifyJsPlugin( { parallel: true } ) ]
  },

  module: {
    rules: [{
      exclude: /node_modules/,
      use: { loader: 'babel-loader' }
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/index.min.css'
    })
  ]
};
