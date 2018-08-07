const path = require('path');
const webpack = require('webpack');
const DefinePlugin = webpack.DefinePlugin;
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin

const pkg = require('./package.json');

// Environment config
const NODE_ENV = process.env.NODE_ENV || 'production';
const DIST_DIR = path.join(__dirname, 'build');
const isProduction = NODE_ENV === 'production';

<<<<<<< HEAD
/**
 * CROSS-BROWSER COMPATIBILITY (and other builds)
 * We use different build configurations depending on browser (or other builds, like canary).
 * For example, browsers have different support for properties on manifest.json
 */

<<<<<<< HEAD
// Webpack Plugins
var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var DedupePlugin = webpack.optimize.DedupePlugin;
var DefinePlugin = webpack.DefinePlugin;
var BannerPlugin = webpack.BannerPlugin;
var MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

/**
 * CROSS-BROWSER COMPATIBILITY (and other builds)
 * We use different build configurations depending on browser (or other builds, like canary).
 * For example, browsers have different support for properties on manifest.json
 */

=======
>>>>>>> origin/dev
// versions we produce
const BUILD = {
  FIREFOX: 'FIREFOX',
  CHROME: 'CHROME',
  CANARY: 'CANARY',
}
<<<<<<< HEAD

// browser/build-specific manifest file created during build.
// `merge-jsons-webpack-plugin` needs relative paths from the build folder.
const MANIFEST_OUTPUT = `../manifest.json`

// manifest.json properties shared by all builds
const BASE_MANIFEST = `manifest/base.manifest.json`

// target BUILD parameter is case insensitive (default chrome)
const interpretTargetBuild = (requested = '') => {
  return Object.keys(BUILD)
    .find(build => build == requested.toUpperCase())
    || BUILD.CHROME
}

// each build can extend the base manifest with a file of this form
const getManifestExtension = (targetBuild) =>
  `manifest/${targetBuild.toLowerCase()}.manifest.json`

// grab target build parameter (passed as command arg)
const targetBuild = interpretTargetBuild(process.env.BUILD)

// grab manifest extension
const manifestExtension = getManifestExtension(targetBuild)
=======
>>>>>>> origin/dev
=======
const BuildConfig = require('./build.config');
const env = BuildConfig.entries();
const manifestFiles = BuildConfig.manifestFiles();

console.log(`
  Building Augury with the following environment options:
   ${Object.keys(env).map(k => `${k}: ${env[k]}`).join('\n   ')}
`);
>>>>>>> upstream/augury2-poc

/*
 * Config
 */
module.exports = {
  mode: env.PROD_MODE ? 'production' : 'development',
  devtool: env.PROD_MODE ? false : ' source-map',
  cache: true,
  context: __dirname,
  stats: {
    colors: true,
    reasons: true,
  },

  entry: {
    'frontend': [
      './src/frontend/vendor',
      './src/frontend/module',
    ],
    'backend': ['./src/backend/backend'],
    'ng-validate': ['./src/utils/ng-validate'],
    'devtools': ['./src/devtools/devtools'],
    'content-script': ['./src/content-script'],
    'background': [
      './src/channel/channel',
      './src/sentry-connection/sentry-connection',
      './src/gtm-connection/gtm-connection',
    ],
  },

  // Config for our build files
  output: {
    path: DIST_DIR,
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[name].chunk.js',
  },

  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: ['./node_modules'],
    alias: {
      'backend': path.resolve('./src/backend'),
      'frontend': path.resolve('./src/frontend'),
      'communication': path.resolve('./src/communication'),
      'feature-modules': path.resolve('./src/feature-modules'),
      'tree': path.resolve('./src/tree')
    }
  },

  // Opt-in to the old behavior with the resolveLoader.moduleExtensions
  // - https://webpack.js.org/guides/migrating/#automatic-loader-module-name-extension-removed
  resolveLoader: {
    modules: ['./node_modules'],
    moduleExtensions: ['-loader'],
  },

  module: {
    rules: [
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        use: '@ngtools/webpack',
      },
      {
        test: /\.css$/,
        use: [
          'to-string-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.png$/,
        use: 'url-loader?mimetype=image/png',
      },
      {
        test: /\.html$/,
        use: 'raw-loader',
      },
    ],
  },

  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin(DIST_DIR),
<<<<<<< HEAD
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'PRODUCTION': JSON.stringify(isProduction),
      'VERSION': JSON.stringify(pkg.version),
      'SENTRY_KEY': JSON.stringify(process.env.SENTRY_KEY),
    }),
<<<<<<< HEAD
    new OccurenceOrderPlugin(),
    new DedupePlugin(),
    new MergeJsonWebpackPlugin({
        "files": [
            BASE_MANIFEST,
            manifestExtension,
        ],
        "output": {
            "fileName": MANIFEST_OUTPUT
        }
    }),
  ].concat((NODE_ENV == 'production') ?  [
    new UglifyJsPlugin()
  ] : [
    // ... dev-only plugins
=======
=======
    new DefinePlugin(BuildConfig.stringifyValues(env)),
>>>>>>> upstream/augury2-poc
    new AngularCompilerPlugin({
      tsConfigPath: 'tsconfig.json',
      entryModule: './src/frontend/module#FrontendModule',
      sourceMap: true,
    }),
    new MergeJsonWebpackPlugin({
      files: manifestFiles,
      output: {
        fileName: '../manifest.json',
      },
    }),
<<<<<<< HEAD
  ].concat((isProduction) ?  [
    // ... prod-only plugins
  ] : [
    // ... dev-only plugins
    // new BundleAnalyzerPlugin(),
>>>>>>> origin/dev
  ]),
=======
  ].concat((env.PROD_MODE) ?  [
    // ... prod-only pluginss
    ] : [
      // ... dev-only plugins
      // new BundleAnalyzerPlugin(),
    ]
  ),
>>>>>>> upstream/augury2-poc

  /*
   * When using `templateUrl` and `styleUrls` please use `__filename`
   * rather than `module.id` for `moduleId` in `@View`
   */
  node: {
    crypto: false,
    __filename: true,
  },
};
