const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
	entry: {
		popup: './src/popup/index.tsx',
		content: './src/content/content.ts',
		background: './src/background/background.ts',
		sidepanel: './src/popup/sidepanel.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		clean: true,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
		}),
		new HtmlWebpackPlugin({
			template: './public/popup.html',
			filename: 'popup.html',
			chunks: ['popup'],
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'public/icons', to: 'icons' },
				{ from: 'public/prompt.txt', to: '.' },
				{ from: 'manifest.json', to: '.' },
				{ from: 'public/sidepanel.html', to: '.' },
			],
		}),
	],
};
