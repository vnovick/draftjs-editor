var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var postcssMergeRules = require('postcss-merge-rules');
var postcssMergeLonghands = require('postcss-merge-longhand');
var postcssMergeIdents = require('postcss-merge-idents');
var cssMqPacker = require('css-mqpacker');
var postcssSvgGo = require('postcss-svgo');


const autoprefix = {
  browsers: [
    'last 2 Chrome versions',
    'last 2 iOS versions',
    'last 1 ff version',
    'last 1 ie version',
    'Android >= 4',
    'Android 2.3',
    'last 2 Edge versions',
  ],
};

var isDev = process.env.NODE_ENV === 'development';


var devEntries =  isDev ? ['webpack-dev-server/client?http://localhost:8080'] : []

var settings = {
    resolve: {
        modulesDirectories: ["node_modules", "bower_components", "./frontend"],
        extensions: ["", ".js", ".min.js", ".scss", ".css"]
    },
    entry: {
        poc: devEntries.concat([
            './frontend/poc/app.js',
            './frontend/poc/styles/app.scss'
        ]),
        app: devEntries.concat([
            './frontend/app.js'
        ]),
        preview: devEntries.concat([
          './frontend/preview/app.js'
        ])
    },
    devtool: "source-map",
    output: {
        publicPath: 'public/assets',
        path: './public/assets',
        filename: '[name].js',
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("css?sourceMap!sass?sourceMap!postcss")
            },
            {
              test: /\.css$/,
              loader: 'style!css?sourceMap'
            },
            {
                test: /\.(ttf|eot|woff|svg|jpe?g|gif|png)[\?]?.*$/,
                loader: 'file',
                query: {
                    name: '[name][hash].[ext]',
                    limit: 10000
                }
            },
            {
                test: /\.js$/,
                loader: "babel",
                exclude: [
                    /node_modules/,
                    /libs/,
                    /vendor/,
                    /bower_components/,
                ]
            },
            {
                test: /\.css$/,
                loader: "style!css?sourceMap",
                exclude: [
                    /node_modules/,
                    /libs/,
                    /vendor/
                ]
            }
        ]
    },
    sassLoader: {
      sourceMapContents: true
    },
    postcss: () => [
        autoprefixer(autoprefix),
        postcssMergeRules,
        postcssMergeLonghands,
        postcssMergeIdents,
        cssMqPacker,
        postcssSvgGo,
    ],
    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom'
      }),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: JSON.stringify("development")
        }
      }),
      new ExtractTextPlugin("styles.css")
    ]
};
if (isDev){
  Object.assign(settings, {
    devServer: {
        contentBase: "public",
        inline: true,
        hot: true,
        watch: true
    },
    plugins: settings.plugins.concat([new webpack.HotModuleReplacementPlugin()])
  })
}
console.log(settings);
module.exports = settings;


