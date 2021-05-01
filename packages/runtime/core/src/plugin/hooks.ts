import {
  SyncHook,
  AsyncSeriesBailHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
} from '@garfish/hooks';
import { injectable } from 'inversify';
import { Garfish } from '../instance/context';
import { interfaces } from '../interface';
import { Options, AppInfo, LoadAppOptions } from '../type';

export function keys<O>(o: O) {
  return Object.keys(o) as (keyof O)[];
}

type BootStrapArgs = [Garfish, Options];

type ConstructorParameters<T> = T extends SyncHook<any, any>
  ? T extends { tap: (options: any, fn: (...args: infer P) => infer R) => any }
    ? (...args: P) => R
    : never
  : T extends {
      tapPromise: (options: any, fn: (...args: infer A) => infer AR) => any;
    }
  ? (...args: A) => AR
  : never;

type PickParam<T> = {
  [k in keyof T]: ConstructorParameters<T[k]>;
};

export type Plugin = { name: string } & PickParam<
  Partial<interfaces.Lifecycle>
>;

@injectable()
export class Hooks implements interfaces.Hooks {
  public lifecycle: interfaces.Lifecycle;

  constructor() {
    this.lifecycle = {
      beforeInitialize: new SyncHook(['context', 'options']),
      initialize: new SyncHook(['context', 'options']),
      beforeBootstrap: new SyncHook(['context', 'options']),
      bootstrap: new SyncHook(['context', 'options']),
      beforeRegisterApp: new SyncHook(['context', 'appInfos']),
      registerApp: new SyncHook(['context', 'appInfos']),
      beforeLoad: new AsyncSeriesBailHook(['context', 'appInfo']),
      afterLoad: new AsyncSeriesBailHook(['context', 'appInfo']),
      errorLoadApp: new SyncHook(['context', 'appInfo', 'error']),
      beforeEval: new SyncHook([
        'context',
        'appInfo',
        'code',
        'env',
        'sourceUrl',
        'options',
      ]),
      afterEval: new SyncHook([
        'context',
        'appInfo',
        'code',
        'env',
        'sourceUrl',
        'options',
      ]),
      beforeMount: new SyncHook(['context', 'appInfo']),
      afterMount: new SyncHook(['context', 'appInfo']),
      errorMount: new SyncHook(['context', 'appInfo', 'error']),
      beforeUnMount: new SyncHook(['context', 'appInfo']),
      afterUnMount: new SyncHook(['context', 'appInfo']),
      errorExecCode: new SyncHook(['context', 'appInfo', 'error']),
    };
  }

  public usePlugins(plugin: Plugin) {
    const lifecycleKeys = keys(this.lifecycle);
    const pluginName = plugin.name;
    lifecycleKeys.forEach((key) => {
      const pluginLife = plugin[key];
      if (!pluginLife) return;

      const cst = this.lifecycle[key].constructor;
      // 区分不同的hooks类型，采用不同的注册策略
      if (
        cst === AsyncParallelBailHook ||
        cst === AsyncSeriesBailHook ||
        cst === AsyncParallelBailHook
      ) {
        (this.lifecycle[key] as any).tapPromise(pluginName, pluginLife);
      } else {
        (this.lifecycle[key] as any).tap(pluginName, pluginLife);
      }
    });
  }
}

export const hooks = new Hooks();