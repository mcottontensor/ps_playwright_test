const package = require('./package.json');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        index: './src/streamtest-client.ts'
    },
	plugins: [
		new HtmlWebpackPlugin({
			title: "Stream Test",
			template: "./html/index.html",
			filename: "index.html",
		})
	],
    module: {
        rules: [
			// Loader for *.ts files
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: [/node_modules/]
            },
			// Loader for *.html files
			{
				test: /\.html$/i,
				use: 'html-loader'
			},
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
		filename: 'streamtest-client.js',
		library: 'streamtest-client',
		libraryTarget: 'umd',
		path: path.resolve(__dirname, 'www'),
		clean: true,
		globalObject: 'this',
		hashFunction: 'xxhash64'
    },
	experiments: {
		futureDefaults: true
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'www'),
		},
	},
};
