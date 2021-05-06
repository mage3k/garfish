import Garfish, { interfaces } from '@garfish/core';
import { assert, warn } from '@garfish/utils';
import { App } from './app';

declare module '@garfish/core' {
  export default interface Garfish {
    setExternal: (
      nameOrExtObj: string | Record<string, any>,
      value?: any,
    ) => void;
    externals: Record<string, any>;
    loadApp(opts: interfaces.LoadAppOptions): Promise<interfaces.App>;
  }

  export namespace interfaces {
    export interface App {
      name: string;
      appInfo: AppInfo;
      cjsModules: Record<string, any>;
      customExports: Record<string, any>; // If you don't want to use the CJS export, can use this
      mounted: boolean;
      appContainer: HTMLElement;
      provider: Provider;
      htmlNode: HTMLElement | ShadowRoot;
      isHtmlMode: boolean;
      strictIsolation: boolean;
      mount(): Promise<boolean>;
      unmount(): boolean;
      getExecScriptEnv(noEntry: boolean): Record<string, any>;
      execScript(
        code: string,
        env: Record<string, any>,
        url?: string,
        options?: {
          async?: boolean;
          noEntry?: boolean;
        },
      ): void;
    }
  }
}

export default function cjsApp(Garfish: Garfish): interfaces.Plugin {
  Garfish.setExternal = setExternal;

  function setExternal(
    nameOrExtObj: string | Record<string, any>,
    value?: any,
  ) {
    assert(nameOrExtObj, 'Invalid parameter.');
    if (typeof nameOrExtObj === 'object') {
      for (const key in nameOrExtObj) {
        if (Garfish.externals[key]) {
          __DEV__ && warn(`The "${key}" will be overwritten in external.`);
        }
        Garfish.externals[key] = nameOrExtObj[key];
      }
    } else {
      Garfish.externals[nameOrExtObj] = value;
    }
  }

  return {
    name: 'cjs-app',
    initializeApp(context, appInfo, resource, ResourceModules, isHtmlModule) {
      const instance = new App(
        context,
        appInfo,
        resource,
        ResourceModules,
        isHtmlModule,
      );
      instance.cjsModules.require = (name) => Garfish.externals[name];
      return Promise.resolve(instance);
    },
  };
}
