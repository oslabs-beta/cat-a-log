const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  mode: 'development',
  entry: {
    bundle: path.resolve(__dirname, 'client/index.ts'), // Entry point name is 'bundle'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js', // Filename template for JS bundles.  Assigns bundle to [name], [contenthash] appends a unique hash to each rebuild of bundle.
    clean: true, // Cleans old files in the output directory before each build
    assetModuleFilename: '[name][ext]', // Template for assets file names & their file extensions
  },
  //maps from bundle to source creating bundle.map file.  Apparently helpful for debugging w/in the bundle...?
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'), // serve static files from 'dist'
    },
    //changed from 3000 to 8080
    port: 8080,
    open: true, // Automatically opens browser when server starts
    hot: true, //  Enables Hot Module Replacement (HMR) w/out reloading/refreshing the whole page
    compress: true,
    historyApiFallback: true, //unknown routes redirect user to index.html..?
  },
  // Enable importing JS / JSX files without specifying their extension
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'], 
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,////// TODO: POTENTIAL PROBLEM
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.css$/, 
        use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   //presets are defined in my .babelrc file including preset for react
          //     presets: ['@babel/preset-env']
          // },
        },
      },
      {
        //for being able to load images
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  // resolve: {
  //   extensions: ['.js', '.jsx'],
  // },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Cat-A-Log',
      filename: 'index.html',
      template: 'client/template.html', //relative path of template.html
    }),
    // new BundleAnalyzerPlugin(),
  ],
};