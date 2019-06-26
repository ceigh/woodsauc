'use strict';

import UglifyJsPlugin       from 'uglifyjs-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin    from 'copy-webpack-plugin';
import HtmlWebpackPlugin    from 'html-webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';

const WEBPACK_MODE = process.env.WEBPACK_MODE || 'development';
const isDev = 'development' === WEBPACK_MODE;

export default {
  mode: WEBPACK_MODE,
  watch: isDev,
  watchOptions: {aggregateTimeout: 100},
  devtool: isDev ? 'eval' : '(none)',

  context: `${__dirname}/src`,
  entry: {
    preloader: './js/preloader',
    dashboard: './js/dashboard'
  },

  output: {
    library: 'WoodsAuc',
    publicPath: '/',
    filename: isDev ?
              './js/[name].[hash].js' :
              './js/[name].[hash].min.js'
  },

  plugins: [
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({
      filename: isDev ?
                './css/[name].[hash].css' :
                './css/[name].[hash].min.css'
    }),

    new HtmlWebpackPlugin({
      template: 'html/dashboard.pug'
    }),

    new CopyWebpackPlugin([
      {
        from: './img',
        to: './img'
      },
      {
        from: './light.mp3',
        to: './light.mp3'
      },
      {
        from: './manifest.json',
        to: './manifest.json'
      },
      {
        from: './browserconfig.xml',
        to: './browserconfig.xml'
      }
    ])
  ],

  optimization: {
    minimizer: isDev ?
      [() => {}] :
      [new UglifyJsPlugin({parallel: true})]
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }, {
      test: /\.pug$/,
      use: ['pug-loader']
    }]
  },

  devServer: {
    contentBase: `${__dirname}/dist`,
    compress: true,
    port: 9000
  }
};
