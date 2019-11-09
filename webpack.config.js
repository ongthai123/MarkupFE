var HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: [
        './src/index.jsx'
    ],
    output:{
        path: __dirname,
        publicPath: '/dist',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    devServer: {
        historyApiFallback: true
      },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                query: {compact: false}
            },
            { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        }
    },
    plugins: [new HtmlWebpackPlugin({
        template: './src/index.html'
    })],
    devServer: {
        historyApiFallback: true,
        port: 8080
    },
    externals: {
        // global app config object
        config: JSON.stringify({
            apiUrl: 'http://markup-env.b4ypszqaxb.ap-southeast-2.elasticbeanstalk.com'
        })
    }
}