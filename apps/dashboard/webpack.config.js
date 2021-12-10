const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/**
 * We use the NX_TSCONFIG_PATH environment variable when using the @nrwl/angular:webpack-browser
 * builder as it will generate a temporary tsconfig file which contains any required remappings of
 * shared libraries.
 * A remapping will occur when a library is buildable, as webpack needs to know the location of the
 * built files for the buildable library.
 * This NX_TSCONFIG_PATH environment variable is set by the @nrwl/angular:webpack-browser and it contains
 * the location of the generated temporary tsconfig file.
 */
const tsConfigPath =
  process.env.NX_TSCONFIG_PATH ??
  path.join(__dirname, '../../tsconfig.base.json');

const workspaceRootPath = path.join(__dirname, '../../');
const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  tsConfigPath,
  [
    /* mapped paths to share */
    '@ng-mfe/shared/auth',
  ],
  workspaceRootPath
);

module.exports = {
  output: {
    uniqueName: 'dashboard',
    publicPath: (resourcePath, context) => {
      console.log(resourcePath, context);
      return '';
    },
  },
  optimization: {
    runtimeChunk: false,
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        login: `https://nx-mfe-deploy-login.netlify.app/remoteEntry.mjs`,
        todo: `https://nx-mfe-deploy-todo.netlify.app/remoteEntry.js`,
        // login: `http://localhost:4201/remoteEntry.mjs`,
        // todo: `http://localhost:4202/remoteEntry.js`,
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/common/http': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        ...sharedMappings.getDescriptors(),
      },
      library: { type: 'module' },
    }),

    sharedMappings.getPlugin(),
  ],
};
