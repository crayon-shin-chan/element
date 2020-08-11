<script>
const ORIGINAL_THEME = '#409EFF';
import { get as ajaxGet } from './ajax.js';
import { updateDomHeadStyle } from '../utils.js';

export default {
  data() {
    return {
      docs: '', // css字符串
      theme: ORIGINAL_THEME,//默认主题色
      asyncCb: true//异步回调
    };
  },
  methods: {
    updateDocStyle(e, cb) {
      const val = e.global['$--color-primary'] || ORIGINAL_THEME;//获取新主题色
      const oldVal = this.theme;//原主题色
      /** 处理器更新指定dom元素的内容为新的css字符串，并且更新指定变量 */
      const getHandler = (variable, id) => {
        return () => {
          let newStyle = this.updateStyle(this[variable], ORIGINAL_THEME, val);
          updateDomHeadStyle(id, newStyle);
          this.asyncCb && cb();
        };
      };
      /** 更新docs变量、id为docs-style的元素的处理器 */
      const docsHandler = getHandler('docs', 'docs-style');
      /** 当前不存在更新后css字符串 */
      if (!this.docs) {
        /** 获取href包含docs.css的link元素列表 */  
        const links = [].filter.call(document.querySelectorAll('link'), link => {
          return /docs\..+\.css/.test(link.href || '');
        });
        /** 获取css字符串存储在docs中 */
        if (links[0]) {
          this.getCSSString(links[0].href, docsHandler, 'docs');
        } else {
          this.asyncCb = false;
        }
      } else {
        docsHandler();//更新css字符串
      }
      /** 获取所有内容包含oldVal以及!/Chalk Variables/的style元素 */
      const styles = [].slice.call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText;
          return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text);
        });
      styles.forEach(style => {
        const { innerText } = style;
        if (typeof innerText !== 'string') return;
        /** 更新style元素内部css字符串 */
        style.innerText = this.updateStyle(innerText, oldVal, val);
      });
      this.theme = val;//新的主题
      !this.asyncCb && cb();
    },
    /** 更新css字符串文本，返回替换后新的文本 */
    updateStyle(style, oldColor, newColor) {
      /** 替换指定颜色 */  
      return style.replace(new RegExp(oldColor, 'ig'), newColor);
    },
    /** 获取指定url的css字符串，存储到变量中 */
    getCSSString(url, callback, variable) {
      ajaxGet(url).then((res) => {
        this[variable] = res;
        callback();
      });
    }
  }
};
</script>
