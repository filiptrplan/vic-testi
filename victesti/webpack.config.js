/* eslint-disable no-undef */
// Webpack uses this to work with directories
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

// This is the main configuration object.
// Here you write different options and tell Webpack what to do
module.exports = {
    // Path to your entry point. From this file Webpack will begin his work
    entry: {
        babel: "babel-polyfill",
        index: "./static/src/index.js",
        base: {
            import: "./static/src/js/base.js",
            dependOn: "shared",
        },
        upload: {
            import: "./static/src/js/upload.js",
            dependOn: "shared"
        },
        shared: 'cash-dom'
    },

    // Path and filename of your result bundle.
    // Webpack will bundle all JavaScript into this file
    output: {
        path: path.resolve(__dirname, "static/dist"),
        publicPath: "/static/",
        filename: "js/[name].bundle.js",
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "css/app.css",
        }),
        new CopyWebpackPlugin({
            patterns: [{ from: "static/src/images", to: "images" }],
        }),
    ],
    watchOptions: {
        poll: true,
        aggregateTimeout: 300,
    },
    devServer: {
        contentBase: "./static/dist/",
        publicPath: "/static/",
        hot: true,
        writeToDisk: true,
        proxy: {
            "!/static/**": {
                target: "http://localhost:8000", // points to django dev server
                changeOrigin: true,
            },
        },
    },
    optimization: {
        runtimeChunk: "single",
    },
};
