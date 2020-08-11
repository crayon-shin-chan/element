import Pager from './pager.vue';
import ElSelect from 'element-ui/packages/select';
import ElOption from 'element-ui/packages/option';
import ElInput from 'element-ui/packages/input';
import Locale from 'element-ui/src/mixins/locale';
import { valueEquals } from 'element-ui/src/utils/util';

/** 分页组件 */
export default {

  name: 'ElPagination',

  props: {
    //每页显示条目个数，支持 .sync 修饰符
    pageSize: {
      type: Number,
      default: 10
    },
    //是否使用小型分页样式
    small: Boolean,
    //总条目数
    total: Number,
    //总页数，total 和 page-count 设置任意一个就可以达到显示页码的功能；如果要支持 page-sizes 的更改，则需要使用 total 属性
    pageCount: Number,
    //页码按钮的数量，当总页数超过该值时会折叠
    pagerCount: {
      type: Number,
      validator(value) {
        return (value | 0) === value && value > 4 && value < 22 && (value % 2) === 1;//奇数、大于4小于22
      },
      default: 7
    },
    //当前页数，支持 .sync 修饰符
    currentPage: {
      type: Number,
      default: 1
    },
    //组件布局，子组件名用逗号分隔，默认为：上一页 1 2 3 4 5 6 7 下一页 跳到 -> 总数
    layout: {
      default: 'prev, pager, next, jumper, ->, total'
    },
    //每页显示个数选择器的选项设置
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 40, 50, 100];
      }
    },
    //每页显示个数选择器的下拉框类名
    popperClass: String,
    //替代图标显示的上一页文字
    prevText: String,
    //替代图标显示的下一页文字
    nextText: String,
    //是否为分页按钮添加背景色
    background: Boolean,
    //是否禁用
    disabled: Boolean,
    //只有一页时是否隐藏
    hideOnSinglePage: Boolean
  },

  data() {
    return {
      internalCurrentPage: 1,//内部页码
      internalPageSize: 0,//内部页大小
      lastEmittedPage: -1,//最后页面
      userChangePageSize: false//用户改变页大小
    };
  },
  /** 渲染函数 */
  render(h) {
    /** 布局不存在，不渲染 */  
    const layout = this.layout;
    if (!layout) return null;
    /** 单页不显示 */  
    if (this.hideOnSinglePage && (!this.internalPageCount || this.internalPageCount === 1)) return null;
    /** 模板为div，jsx */
    let template = <div class={['el-pagination', {
      'is-background': this.background,//为分页按钮添加背景色
      'el-pagination--small': this.small//小的分页样式
    }]}></div>;
    /** 子组件模板映射 */  
    const TEMPLATE_MAP = {
      prev: <prev></prev>,//上一页
      jumper: <jumper></jumper>,//跳转
      pager: <pager currentPage={ this.internalCurrentPage } pageCount={ this.internalPageCount } pagerCount={ this.pagerCount } on-change={ this.handleCurrentChange } disabled={ this.disabled }></pager>,
      next: <next></next>,//下一页
      sizes: <sizes pageSizes={ this.pageSizes }></sizes>,//size选择器
      slot: <slot>{ this.$slots.default ? this.$slots.default : '' }</slot>,//默认插槽
      total: <total></total>//总数
    };
    const components = layout.split(',').map((item) => item.trim());//子组件数组
    const rightWrapper = <div class="el-pagination__rightwrapper"></div>;
    let haveRightWrapper = false;

    template.children = template.children || [];
    rightWrapper.children = rightWrapper.children || [];
    components.forEach(compo => {
      /** 组件需要右包装 */      
      if (compo === '->') {
        haveRightWrapper = true;
        return;
      }
      /** 需要右包装的添加到包装的子列表 */
      if (!haveRightWrapper) {
        template.children.push(TEMPLATE_MAP[compo]);
      } else {
        rightWrapper.children.push(TEMPLATE_MAP[compo]);
      }
    });

    if (haveRightWrapper) {
      template.children.unshift(rightWrapper);
    }

    return template;
  },

  /** 子组件内容 */
  components: {
    /** 上一页 */    
    Prev: {
      render(h) {
        return (
          <button
            type="button"
            class="btn-prev"
            disabled={ this.$parent.disabled || this.$parent.internalCurrentPage <= 1 }//父组件禁用或者页码小于等于1时禁用
            on-click={ this.$parent.prev }>
            {
              this.$parent.prevText//上一页文本，或者图标
                ? <span>{ this.$parent.prevText }</span>
                : <i class="el-icon el-icon-arrow-left"></i>
            }
          </button>
        );
      }
    },
    /** 下一页 */
    Next: {
      render(h) {
        return (
          <button
            type="button"
            class="btn-next"
            disabled={ this.$parent.disabled || this.$parent.internalCurrentPage === this.$parent.internalPageCount || this.$parent.internalPageCount === 0 }
            on-click={ this.$parent.next }>
            {
              this.$parent.nextText
                ? <span>{ this.$parent.nextText }</span>
                : <i class="el-icon el-icon-arrow-right"></i>
            }
          </button>
        );
      }
    },
    /** page size选择器 */
    Sizes: {
      mixins: [Locale],

      props: {
        pageSizes: Array//选项数组
      },

      watch: {
        pageSizes: {
          immediate: true,//侦听开始后立即调用
          handler(newVal, oldVal) {
            if (valueEquals(newVal, oldVal)) return;//新劳值相等，直接返回
            if (Array.isArray(newVal)) {//新值是在、数组
              this.$parent.internalPageSize = newVal.indexOf(this.$parent.pageSize) > -1//原来的pageSize是否在新值数组中
                ? this.$parent.pageSize//在就使用原来的pageSize
                : this.pageSizes[0];//不在就使用新数组的第一个
            }
          }
        }
      },

      render(h) {
        return (
          <span class="el-pagination__sizes">
            <el-select
              value={ this.$parent.internalPageSize }//绑定值是内部page size
              popperClass={ this.$parent.popperClass || '' }
              size="mini"
              on-input={ this.handleChange }
              disabled={ this.$parent.disabled }>
              {
                this.pageSizes.map(item =>
                  <el-option
                    value={ item }
                    label={ item + this.t('el.pagination.pagesize') }>
                  </el-option>
                )
              }
            </el-select>
          </span>
        );
      },

      components: {
        ElSelect,
        ElOption
      },

      methods: {
        /** 选择page size处理器 */  
        handleChange(val) {
          if (val !== this.$parent.internalPageSize) {
            /** 设置内部page size */  
            this.$parent.internalPageSize = val = parseInt(val, 10);
            this.$parent.userChangePageSize = true;//使用了更改的pageSize
            this.$parent.$emit('update:pageSize', val);
            this.$parent.$emit('size-change', val);
          }
        }
      }
    },
    /** 跳转组件 */
    Jumper: {
      mixins: [Locale],

      components: { ElInput },

      data() {
        return {
          userInput: null
        };
      },

      watch: {
        /** 父组件当前页更改时，用户输入跳转页设为空 */    
        '$parent.internalCurrentPage'() {
          this.userInput = null;
        }
      },

      methods: {
        handleKeyup({ keyCode, target }) {
          // Chrome, Safari, Firefox triggers change event on Enter
          // Hack for IE: https://github.com/ElemeFE/element/issues/11710
          // Drop this method when we no longer supports IE
          /** 按下enter键触发跳转 */    
          if (keyCode === 13) {
            this.handleChange(target.value);
          }
        },
        handleInput(value) {
          this.userInput = value;
        },
        /** 跳转处理方法 */
        handleChange(value) {
          /** 设置当前页 */    
          this.$parent.internalCurrentPage = this.$parent.getValidCurrentPage(value);
          this.$parent.emitChange();
          this.userInput = null;
        }
      },

      render(h) {
        return (
          <span class="el-pagination__jump">
            { this.t('el.pagination.goto') }
            <el-input
              class="el-pagination__editor is-in-pagination"
              min={ 1 }//最小跳转页
              max={ this.$parent.internalPageCount }//最大跳转页
              value={ this.userInput !== null ? this.userInput : this.$parent.internalCurrentPage }
              type="number"
              disabled={ this.$parent.disabled }
              nativeOnKeyup={ this.handleKeyup }//处理按键
              onInput={ this.handleInput }
              onChange={ this.handleChange }/>
            { this.t('el.pagination.pageClassifier') }
          </span>
        );
      }
    },

    /** 总数组件 */
    Total: {
      mixins: [Locale],

      render(h) {
        return (
          typeof this.$parent.total === 'number'
            ? <span class="el-pagination__total">{ this.t('el.pagination.total', { total: this.$parent.total }) }</span>
            : ''
        );
      }
    },
    /** 多个页码组件 */
    Pager
  },

  methods: {
    /** 处理当前页更改 */  
    handleCurrentChange(val) {
      this.internalCurrentPage = this.getValidCurrentPage(val);//获取有效的当前页
      this.userChangePageSize = true;//用户更改分页大小
      this.emitChange();
    },
    /** 上一页 */
    prev() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage - 1;//新当前页
      this.internalCurrentPage = this.getValidCurrentPage(newVal);//获取有效值
      this.$emit('prev-click', this.internalCurrentPage);
      this.emitChange();
    },
    /** 下一页 */
    next() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage + 1;
      this.internalCurrentPage = this.getValidCurrentPage(newVal);
      this.$emit('next-click', this.internalCurrentPage);
      this.emitChange();
    },
    /** 获取有效当前页 */
    getValidCurrentPage(value) {
      value = parseInt(value, 10);

      const havePageCount = typeof this.internalPageCount === 'number';//总页数

      let resetValue;
      if (!havePageCount) {
        if (isNaN(value) || value < 1) resetValue = 1;
      } else {
        if (value < 1) {//不能小于1
          resetValue = 1;
        } else if (value > this.internalPageCount) {//不能大于总页数
          resetValue = this.internalPageCount;
        }
      }

      if (resetValue === undefined && isNaN(value)) {
        resetValue = 1;
      } else if (resetValue === 0) {
        resetValue = 1;
      }

      return resetValue === undefined ? value : resetValue;
    },
    /** 触发更改 */
    emitChange() {
      this.$nextTick(() => {
        if (this.internalCurrentPage !== this.lastEmittedPage || this.userChangePageSize) {
          this.$emit('current-change', this.internalCurrentPage);
          this.lastEmittedPage = this.internalCurrentPage;//最后一次触发的页码
          this.userChangePageSize = false;//用户更改page size为false，触发更改后设置回false
        }
      });
    }
  },

  computed: {
    /** 内部总页数 */  
    internalPageCount() {
      /** 首先通过总数、分页大小计算 */    
      if (typeof this.total === 'number') {
        return Math.max(1, Math.ceil(this.total / this.internalPageSize));
      } else if (typeof this.pageCount === 'number') {
        return Math.max(1, this.pageCount);
      }
      return null;
    }
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val) {
        this.internalCurrentPage = this.getValidCurrentPage(val);
      }
    },

    pageSize: {
      immediate: true,
      handler(val) {
        this.internalPageSize = isNaN(val) ? 10 : val;
      }
    },

    internalCurrentPage: {
      immediate: true,
      handler(newVal) {
        this.$emit('update:currentPage', newVal);
        this.lastEmittedPage = -1;
      }
    },

    internalPageCount(newVal) {
      /* istanbul ignore if */
      const oldPage = this.internalCurrentPage;
      if (newVal > 0 && oldPage === 0) {
        this.internalCurrentPage = 1;
      } else if (oldPage > newVal) {
        this.internalCurrentPage = newVal === 0 ? 1 : newVal;
        this.userChangePageSize && this.emitChange();
      }
      this.userChangePageSize = false;
    }
  }
};
