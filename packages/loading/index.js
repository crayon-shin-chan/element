import directive from './src/directive';
import service from './src/index';

/** loading导出对象 */
export default {
  /** 插件安装，注册指令、设置$loading */  
  install(Vue) {
    Vue.use(directive);
    Vue.prototype.$loading = service;
  },
  directive,
  service
};
