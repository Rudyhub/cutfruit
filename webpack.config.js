const path = require('path');
const BabiliPlugin = require("babili-webpack-plugin");
module.exports = {
    entry:  path.join(__dirname,'src', 'main.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "cutfruit.js"
    },
    module:{
        rules: [
            { test: /\.css$/, use: "style-loader!css-loader" },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new BabiliPlugin()
    ]
};
