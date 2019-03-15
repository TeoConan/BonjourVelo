<<<<<<< HEAD
const dev = true;
=======
const webpack = require("webpack");
const path = require("path");
const ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const autoprefixer = require('autoprefixer');
const dev = true;
<<<<<<< HEAD
=======
const dev = true;
>>>>>>> 207b1f5ef3e75b50faea48da9d55cba4d83f8eb0
>>>>>>> master
=======
>>>>>>> master

let config = {
    entry: "./src/index.js",
    mode: "development",
<<<<<<< HEAD
    devtool: "eval-source-map",

=======
    devtool: "eval-source-map",

<<<<<<< HEAD
=======
    devtool: "eval-source-map",

>>>>>>> 207b1f5ef3e75b50faea48da9d55cba4d83f8eb0
>>>>>>> master
=======
>>>>>>> master
    output: {
      path: path.resolve(__dirname, "./public"),
      filename: "./bundle.js"
    },
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> master
=======
>>>>>>> master

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> master
=======
>>>>>>> master
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
<<<<<<< HEAD

<<<<<<< HEAD
=======
=======

>>>>>>> 207b1f5ef3e75b50faea48da9d55cba4d83f8eb0
>>>>>>> master
=======
		
>>>>>>> master
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