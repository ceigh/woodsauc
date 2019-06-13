'use strict';

import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

const WEBPACK_MODE = process.env.WEBPACK_MODE || 'development';

export default {
  mode: WEBPACK_MODE,

  context: `${__dirname}/assets/js`,
  entry: {
    script: './script'
  },

  output: {
    library: 'woodsauc',
    path: `${__dirname}/src/auction/static/build`,
    filename: WEBPACK_MODE === 'development' ?
                               'js/[name]/[name].js' :
                               'js/[name]/[name].min.js'
  },

  watch: WEBPACK_MODE === 'development',
  watchOptions: {
    aggregateTimeout: 100
  },

  devtool: WEBPACK_MODE === 'development' ? 'eval' : '(none)',

  module: {
    rules: [{
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  },

  optimization: {
    minimizer: WEBPACK_MODE === 'production' ?
               [ new UglifyJsPlugin( {parallel: true} ) ] :
               [ () => {} ]
  }
};
