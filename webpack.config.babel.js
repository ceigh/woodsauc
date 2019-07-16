// Imports
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';


// Variables
const WEBPACK_MODE = process.env.WEBPACK_MODE || 'development';
const isDev = WEBPACK_MODE === 'development';


// Exports
module.exports = {
  mode: WEBPACK_MODE,
  watch: isDev,
  watchOptions: { aggregateTimeout: 100 },
  devtool: isDev ? 'eval' : 'source-map',

  context: `${__dirname}/src`,
  entry: {
    sentry: './js/sentry',
    preloader: './js/preloader',
    dashboard: './js/dashboard',
  },

  output: {
    library: 'WoodsAuc',
    publicPath: '/',
    filename: isDev
      ? './js/[name].[hash].js'
      : './js/[name].[hash].min.js',
  },

  plugins: [
    new CleanWebpackPlugin(),

    isDev ? () => {} : new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 6,
      },
    }),

    new MiniCssExtractPlugin({
      filename: isDev
        ? './css/[name].[hash].css'
        : './css/[name].[hash].min.css',
    }),

    new HtmlWebpackPlugin({
      template: 'html/dashboard.pug',
    }),

    new CopyWebpackPlugin([
      {
        from: './img',
        to: './img',
      },
      {
        from: './light.mp3',
        to: './light.mp3',
      },
      {
        from: './manifest.json',
        to: './manifest.json',
      },
      {
        from: './browserconfig.xml',
        to: './browserconfig.xml',
      },
    ]),
  ],

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: isDev
        ? ['babel-loader', 'eslint-loader']
        : ['babel-loader'],
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        'style-loader',
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
      ],
    }, {
      test: /\.pug$/,
      use: ['pug-loader'],
    }],
  },

  devServer: {
    contentBase: `${__dirname}/dist`,
    compress: true,
    port: 9000,
  },
};
