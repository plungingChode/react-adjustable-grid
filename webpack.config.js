const webpack = require("webpack");

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true
  },
  devtool: 'nosources-source-map',
  context: __dirname,
  entry: {
    'react-adjustable-grid': './src/index.ts'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'ReactAdjustableGrid',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
    'react-draggable': {
      commonjs: 'react-draggable',
      commonjs2: 'react-draggable',
      amd: 'react-draggable',
      root: 'Draggable'
    }
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
};
