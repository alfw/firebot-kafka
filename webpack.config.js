const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const packageJson = require("./package.json");

module.exports = {
	target: "node",
	mode: "production",
	devtool: false,
	entry: {
		main: "./src/main.ts"
	},
	plugins: [
		new webpack.DefinePlugin({
			VERSION: process.env.VER
		})
	],
	output: {
		libraryTarget: "commonjs2",
		libraryExport: "default",
		path: path.resolve(__dirname, "./dist"),
		filename: `${packageJson.scriptOutputName}.js`
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader"
			}
		]
	},
	optimization: {
		minimize: false,

		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_fnames: /main/,
					mangle: false,
					format: {
						comments: false
					}
				},
				extractComments: false
			})
		]
	}
};
