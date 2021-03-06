const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const autoprefixer = require('autoprefixer');
const dev = true;

let config = {
    entry: "./src/index.js",
    mode: "development",
    devtool: "eval-source-map",

    output: {
      path: path.resolve(__dirname, "./public"),
      filename: "./bundle.js"
    },

    module: {
        rules: [
        		/* SCSS */
		        {
		        	test: /\.scss$/,
		        	use: [
		        		{
							loader: 'file-loader',
		            		options: {
		              		name: 'bundle.css',
		            		},
		        		},
		        		{ loader: 'extract-loader' },
		          		{ loader: 'css-loader' },
		          		{
		          			loader: 'postcss-loader',
		          			options: {
		          				plugins: () => [autoprefixer()]
		          			}
		          		},
		          		{
		          			loader: 'sass-loader',
		          			options: {
		          				includePaths:['./node_modules']
		          			}
		          		},
		        	]
		        },
		        /* SCSS */
    	        /* JS */
    	        {
    	        	test: /\.js$/,
    	        	loader: 'babel-loader',
    	        	exclude: /node_modules/,
    	        }
    	        /* JS */
			]
      	},

      	plugins: [
			  new ExtractTextWebpackPlugin("general-styles.css")
      	],

      	devServer: {
		  contentBase: path.resolve(__dirname, "./public"),
		  historyApiFallback: true,
		  inline: true,
		  open: true,
		  hot: true
		},
		
  }
  module.exports = config;








  /* SAVE */
  /*

const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");

let config = {
    entry: "./src/index.js",
    mode: "development",
    output: {
      path: path.resolve(__dirname, "./public"),
      filename: "./bundle.js"
    },
    module: {
        rules: [{
			  test: /\.scss$/,
			  use: ['css-hot-loader'].concat(ExtractTextWebpackPlugin.extract({
			    fallback: 'style-loader',
			    use: ['css-loader', 'sass-loader', 'postcss-loader'],
			  }))
			}]
      	},
      	plugins: [
        new ExtractTextWebpackPlugin("styles.css")
      	],
      	devServer: {
		  contentBase: path.resolve(__dirname, "./public"),
		  historyApiFallback: true,
		  inline: true,
		  open: true,
		  hot: true
		},
		devtool: "eval-source-map"
  }
  module.exports = config;
const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

let config = {
    entry: "./src/index.js",
    mode: "development",
    output: {
      path: path.resolve(__dirname, "./public"),
      filename: "./bundle.js"
    },
    module: {
        rules: [
		        {
		        	test: /\.scss$/,
		        	use: [
		        		{
							loader: 'file-loader',
		            		options: {
		              		name: 'bundle.css',
		            		},
		        		},
		        		{ loader: 'extract-loader' },
		          		{ loader: 'css-loader' },
		          		{ loader: 'sass-loader' },
		        	]
		        },
		    	{
				  test: /\.scss$/,
				  use: ['css-hot-loader'].concat(ExtractTextWebpackPlugin.extract({
				    fallback: 'style-loader',
				    use: ['css-loader', 'sass-loader', 'postcss-loader'],
				  }))
				}
			]
      	},
      	plugins: [
        new ExtractTextWebpackPlugin("styles.css")
      	],
      	devServer: {
		  contentBase: path.resolve(__dirname, "./public"),
		  historyApiFallback: true,
		  inline: true,
		  open: true,
		  hot: true
		},
		devtool: "eval-source-map"
  }
  module.exports = config;


  */