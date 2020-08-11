<template>
  <el-color-picker
    class="theme-picker"
    popper-class="theme-picker-dropdown"
    v-model="theme"></el-color-picker>
</template>

<style lang="scss">
  .theme-picker {
    height: 80px;
    display: inline-block;
    // @utils-vertical-center;
  }

  .theme-picker .el-color-picker__trigger {
    vertical-align: middle;
  }
  
  .theme-picker-dropdown .el-color-dropdown__link-btn {
    display: none;
  }
</style>

/** 主题选择器组件 */
<script>
  import Element from 'main/index.js';
  const { version } = Element;//element-ui版本

  const ORIGINAL_THEME = '#409EFF';//默认主题
  export default {
    data() {
      return {
        chalk: '', // css字符串
        docs: '', // content of docs css
        theme: ORIGINAL_THEME//主题色
      };
    },

    watch: {
      /** 主题色更改 */  
      theme(val, oldVal) {
        if (typeof val !== 'string') return;
        /** 主题颜色簇，不同深浅 */
        const themeCluster = this.getThemeCluster(val.replace('#', ''));
        /** 原颜色簇 */
        const originalCluster = this.getThemeCluster(oldVal.replace('#', ''));
        /** 获取处理器，更改指定id元素，指定变量的内容为指定css字符串 */
        const getHandler = (variable, id) => {
          return () => {
            /** 默认主题颜色簇 */  
            const originalCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''));
            /** 更新默认主题色为新选择的主题色，获取css字符串 */
            let newStyle = this.updateStyle(this[variable], originalCluster, themeCluster);
            /** style元素 */
            let styleTag = document.getElementById(id);
            /** 不存在则创建 */
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.setAttribute('id', id);
              document.head.appendChild(styleTag);
            }
            styleTag.innerText = newStyle;
          };
        };
        /** 更改chalk变量，style元素id为chalk-style */
        const chalkHandler = getHandler('chalk', 'chalk-style');
        const docsHandler = getHandler('docs', 'docs-style');

        /** chalk不存在，远程获取css字符串 */
        if (!this.chalk) {
          const url = `https://unpkg.com/element-ui@${ version }/lib/theme-chalk/index.css`;
          this.getCSSString(url, chalkHandler, 'chalk');
        } else {
          chalkHandler();
        }

        /** docs不存在 */
        if (!this.docs) {
            /** 获取所有href包含docs.css的link元素 */
          const links = [].filter.call(document.querySelectorAll('link'), link => {
            return /docs\..+\.css/.test(link.href || '');
          });
          /** 获取link指定css内容存储到docs */
          links[0] && this.getCSSString(links[0].href, docsHandler, 'docs');
        } else {
          docsHandler();
        }

        /** 获取所有style元素，过滤出包含oldVal颜色以及包含Chalk Variables的 */
        const styles = [].slice.call(document.querySelectorAll('style'))
          .filter(style => {
            const text = style.innerText;
            return new RegExp(oldVal, 'i').test(text) && !/Chalk Variables/.test(text);
          });
        /** 替换style内部css字符串 */  
        styles.forEach(style => {
          const { innerText } = style;
          if (typeof innerText !== 'string') return;
          style.innerText = this.updateStyle(innerText, originalCluster, themeCluster);
        });
      }
    },

    methods: {
      updateStyle(style, oldCluster, newCluster) {
        let newStyle = style;
        oldCluster.forEach((color, index) => {
          newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index]);
        });
        return newStyle;
      },

      getCSSString(url, callback, variable) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '');
            callback();
          }
        };
        xhr.open('GET', url);
        xhr.send();
      },

      /** 获取指定主题色的颜色簇 */
      getThemeCluster(theme) {

        /** 染色函数，获取深色，tint为染色程度，0.0-0.9，用于等分剩下的颜色值，如果原来的红色值为100，则将100-255分为10份 */  
        const tintColor = (color, tint) => {
          /** 获取红绿蓝三色整数值 */  
          let red = parseInt(color.slice(0, 2), 16);
          let green = parseInt(color.slice(2, 4), 16);
          let blue = parseInt(color.slice(4, 6), 16);
          /** 0即不变 */
          if (tint === 0) { // when primary color is in its rgb space
            return [red, green, blue].join(',');
          } else {
            /** 加深颜色 */  
            red += Math.round(tint * (255 - red));
            green += Math.round(tint * (255 - green));
            blue += Math.round(tint * (255 - blue));

            red = red.toString(16);
            green = green.toString(16);
            blue = blue.toString(16);

            return `#${ red }${ green }${ blue }`;
          }
        };
        /** 获取浅色，原颜色值分为10份，获取不同程度浅色 */
        const shadeColor = (color, shade) => {
          let red = parseInt(color.slice(0, 2), 16);
          let green = parseInt(color.slice(2, 4), 16);
          let blue = parseInt(color.slice(4, 6), 16);

          red = Math.round((1 - shade) * red);
          green = Math.round((1 - shade) * green);
          blue = Math.round((1 - shade) * blue);

          red = red.toString(16);
          green = green.toString(16);
          blue = blue.toString(16);

          return `#${ red }${ green }${ blue }`;
        };

        /** 默认颜色为原主题色 */
        const clusters = [theme];
        
        for (let i = 0; i <= 9; i++) {
          /** 0-0.9等9个较深颜色 */  
          clusters.push(tintColor(theme, Number((i / 10).toFixed(2))));
        }
        /** 获取一个浅色，为原来色值的0.9倍 */
        clusters.push(shadeColor(theme, 0.1));
        return clusters;
      }
    }
  };
</script>