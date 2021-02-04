 var path = require('path');
 var webpack = require('webpack');
 
 module.exports = {
    entry: './build/equal.js',
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'equal.bundle.js',
        libraryTarget: "var",
        library: "eQ"
    },
    mode: 'development',
    stats: {
        colors: true
    },
    devtool: 'source-map',
    resolve: {
        modules: [
            path.resolve(__dirname, 'build/'),
            path.join(__dirname, 'node_modules/')
        ],        
        extensions: ['*', '.js']
    },
    module: {
        rules: [
            // should we need to make specific Classes available as standalone modules, it has to be defined here        
            {
                test: require.resolve("jquery"),
                loader: "expose-loader",
                options: {
                    exposes: ["$", "jQuery"],
                }
            },
            {
                test: require.resolve("./build/Model.js"),
                loader: "expose-loader",
                options: {
                    exposes: ["Model"],
                }
            }
            
        ]
    },
    optimization: {
        minimize: false
    }
 };