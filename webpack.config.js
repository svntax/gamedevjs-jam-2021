const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const DIR_DIST = path.join(__dirname, "dist");

const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

const webpackConfig = {
    module: {
        rules: []
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    },
    devServer: {
        contentBase: DIR_DIST
    },
    resolve: {
        fallback: {
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"]
        }),
        new Dotenv({
            path: "./neardev/dev-account.env"
        }),
    ],
};

const babelConfig = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: ["babel-loader"]
};
webpackConfig.module.rules.push(babelConfig);

module.exports = webpackConfig;