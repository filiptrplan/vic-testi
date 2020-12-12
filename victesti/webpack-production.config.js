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
            dependOn: "libs",
        },
        testDetail: {
            import: "./static/src/js/test-detail.js",
            dependOn: "libs",
        },
        upload: {
            import: "./static/src/js/upload.js",
            dependOn: "libs",
        },
        search: {
            import: "./static/src/js/search.js",
            dependOn: "libs",
        },
        libs: {
            import: [
                "cash-dom",
                "choices.js",
                "find-object",
                "jszip",
                "file-saver",
                "js-sha256",
                "./static/src/js/ajax.js",
                "./static/src/js/cookies.js",
                "./static/src/js/downloadTest.js",
            ],
        },
    },

    // Path and filename of your result bundle.
    // Webpack will bundle all JavaScript into this file
    output: {
        path: path.resolve(__dirname, "static/dist"),
        publicPath: "/static/",
        filename: "js/[name].bundle.js",
    },
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
                    "resolve-url-loader",
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
    optimization: {
        runtimeChunk: 'single'
    },
    resolve: {
        fallback: {
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
        },
    },
};
