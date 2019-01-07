var path = require('path');
var webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/swac.jsx",
    mode: "development",
    devtool: 'inline-source-map',
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
            },{
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }]
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        //new webpack.DefinePlugin({'process.env': {'NODE_ENV': 'production'}})
    ],
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
