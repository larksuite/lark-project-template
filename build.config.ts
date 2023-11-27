import { IPluginCustomBuildConfig } from '@lark-project/js-sdk';
const buildConfig: IPluginCustomBuildConfig = {
  externals: {
    useSafeFormikFieldState: 'useSafeFormikFieldState',
  },
};

export { buildConfig };
