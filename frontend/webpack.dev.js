const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
    clean: true,
  },
  mode: "development",
  devtool: "eval-source-map", 
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
    host: "0.0.0.0", 
    historyApiFallback: true,
    hot: true, 
    liveReload: true, 
    watchFiles: {
      paths: ["src/**/*", "public/**/*"], 
      options: {
        usePolling: true, 
        interval: 1000,
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: "info", 
    },
    compress: true, 
    proxy: [
      {
        context: ["/users"],
        target: "http://backend:8000",
        changeOrigin: true,
      },
    ],
    allowedHosts: "all",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
};
