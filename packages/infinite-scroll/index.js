import InfiniteScroll from './src/main.js';

/* install里注册无限滚动指令 */
InfiniteScroll.install = function(Vue) {
  Vue.directive(InfiniteScroll.name, InfiniteScroll);
};

export default InfiniteScroll;
