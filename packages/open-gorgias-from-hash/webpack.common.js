/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const CopyPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

// Get env vars.
require("dotenv").config({
  path: path.join(__dirname, ".env.local")
});

// Get the out dir from tsconfig to avoid redundancy.
const {
  compilerOptions: { outDir }
} = require("./tsconfig.json");

// Get package info to avoid redundancy.
const pkg = require("./package.json");

const isDevelopment = process.env.NODE_ENV !== "production";

console.log(`// Building version ${pkg.version}...`);

const [name, company] = pkg.name.replace("@", "").split("/").reverse();
const filename = `${name}.${pkg.version}`;
const fn = name.replace(/-/g, "_");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  devtool: "source-map",
  optimization: {
    usedExports: true
  },
  output: {
    filename: `${filename}.js`,
    path: path.resolve(__dirname, outDir),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true
          }
        }
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              sourceMap: isDevelopment
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [
    // Keep css in js for now. If it gets too big then extract.
    /*new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output, both options are optional.
      filename: `${filename}.css`,
      chunkFilename: "[id].css"
    }),*/
    new CleanWebpackPlugin(),
    /**
     * Inject the test html file, for testing the build.
     * NOTE: This file should never be deployed anywhere.
     */
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: false,
      minify: false,
      templateParameters: {
        options: {
          debug: isDevelopment,
          filename,
          fn,
          gorgiasAppId: process.env.GORGAIS_APP_ID
        }
      }
    }),
    /**
     * Create a WordPress plugin php file, and populate the values from package.json to avoid any
     * pitfalls of changing entries in 2 different places.
     * NOTE: This file is only needed if this build is to be provided as a WordPress plugin.
     */
    new HtmlWebpackPlugin({
      template: "./public/wordpress.ejs",
      filename: `${name}.php`,
      inject: false,
      minify: false,
      // Parsers seem to hate PHP so ignore errors and output the file - the plugin template is correct.
      showErrors: true,
      templateParameters: {
        debug: isDevelopment,
        // Inject the package as params to be used in template.
        ...pkg,
        name: `${company ? company + "-" : ""}${name}`,
        filename,
        fn
      }
    }),
    new ForkTsCheckerWebpackPlugin(),
    // Nothing to copy yet.
    /*new CopyPlugin({
      patterns: [{ from: "./public/assets", to: "assets" }]
    }),*/
    new ESLintPlugin({
      extensions: [".tsx", ".ts", ".js"],
      exclude: "node_modules",
      context: "src"
    })
  ]
};
