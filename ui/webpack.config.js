/* eslint-disable global-require */
const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const port = process.env.PORT || 3000;

module.exports = (_, argv) => {
  const { mode } = argv;
  const isDevelopment = mode === 'development';

  return {
    entry: [
      './src/index.js',
    ],

    output: {
      path: path.resolve(__dirname, 'dist/'),
      publicPath: '/dist/',
      filename: '[name].[contenthash].js',
    },

    plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        title: 'rtr',
        template: 'src/index.html',
        filename: 'index.html',
      }),
      new WebpackPwaManifest({
        name: 'rtr',
        short_name: 'rtr',
        description: 'Broadcast Router Controller',
        background_color: '#ffffff',
        crossorigin: null,
        inject: true,
        ios: true,
        icons: [
          {
            src: path.resolve('src/router.png'),
            sizes: [96, 128, 192, 256, 384, 512],
          },
        ],
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),

    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
      usedExports: true,
    },

    performance: {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },

    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                // this code will evaluate to "false" when
                // "isDevelopment" is "false"
                // otherwise it will return the plugin
                isDevelopment && require('react-refresh/babel'),
              // this line removes falsy values from the array
              ].filter(Boolean),
            },
          },
        },
      ],
    },

    devtool: isDevelopment && 'inline-source-map',

    devServer: isDevelopment ? {
      host: '0.0.0.0',
      port,
      open: false,
      historyApiFallback: {
        index: '/dist/index.html',
      },
      magicHtml: true,
      proxy: {
        '/v1': {
          target: 'http://localhost:8080',
        },
        '/v1/ws': {
          target: 'http://localhost:8080',
          ws: true,
        },
      },
    } : {

    },
  };
};
