const BabiliPlugin = require("babili-webpack-plugin");
module.exports = {
    entry:  __dirname + "/src/main.js",
    output: {
        path: __dirname,
        filename: "cutfruit.js"
    },
    module:{
        loaders: [
            { test: /\.css$/, loader: "style-loader!css-loader" },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new BabiliPlugin()
    ]
};
