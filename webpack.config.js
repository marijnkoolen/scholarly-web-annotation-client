var path = require('path');

module.exports = {
    entry: "./src/main.jsx",
    mode: "development",
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "public/js"),
        libraryTarget: "var",
        library: "ScholarlyWebAnnotator"
    },
    module: {
        rules: [{
                exclude: /node_modules/,
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader'
                }
            }]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                commons: {
                    test: /node_modules/,
                    name: "vendor",
                    chunks: "initial",
                    minSize: 1
                }
            }
        }
    }
};
