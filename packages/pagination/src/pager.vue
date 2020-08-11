<template>
  <!--页码列表-->  
  <ul @click="onPagerClick" class="el-pager">
    <!--第一页-->  
    <li
      :class="{ active: currentPage === 1, disabled }"
      v-if="pageCount > 0"
      class="number">1</li>
    <!--显示前面更多-->  
    <li
      class="el-icon more btn-quickprev"
      :class="[quickprevIconClass, { disabled }]"
      v-if="showPrevMore"
      @mouseenter="onMouseenter('left')"
      @mouseleave="quickprevIconClass = 'el-icon-more'">
    </li>
    <!--显示多个页码--> 
    <li
      v-for="pager in pagers"
      :key="pager"
      :class="{ active: currentPage === pager, disabled }"
      class="number">{{ pager }}</li>
    <!--显示后面更多-->  
    <li
      class="el-icon more btn-quicknext"
      :class="[quicknextIconClass, { disabled }]"
      v-if="showNextMore"
      @mouseenter="onMouseenter('right')"
      @mouseleave="quicknextIconClass = 'el-icon-more'">
    </li>
    <!--总页数-->
    <li
      :class="{ active: currentPage === pageCount, disabled }"
      class="number"
      v-if="pageCount > 1">{{ pageCount }}</li>
  </ul>
</template>

/** 显示多个页码的组件 */
<script type="text/babel">

  export default {
    name: 'ElPager',

    props: {
      currentPage: Number,//当前页

      pageCount: Number,//总页数

      pagerCount: Number,//显示页数

      disabled: Boolean//是否禁用
    },

    watch: {
      /** 显示前面的更多页 */  
      showPrevMore(val) {
        if (!val) this.quickprevIconClass = 'el-icon-more';
      },

      showNextMore(val) {
        if (!val) this.quicknextIconClass = 'el-icon-more';
      }
    },

    methods: {
      /** 点击处理器 */  
      onPagerClick(event) {
        const target = event.target;
        /** 点击ul无用 */
        if (target.tagName === 'UL' || this.disabled) {
          return;
        }
        /** 点击页码 */
        let newPage = Number(event.target.textContent);
        const pageCount = this.pageCount;
        const currentPage = this.currentPage;
        const pagerCountOffset = this.pagerCount - 2;//偏移
        /** 点击了more */
        if (target.className.indexOf('more') !== -1) {
          /** 显示前面更多 */  
          if (target.className.indexOf('quickprev') !== -1) {
            newPage = currentPage - pagerCountOffset;  
          }
          /** 显示后面更多 */
          else if (target.className.indexOf('quicknext') !== -1) {
            newPage = currentPage + pagerCountOffset;
          }
        }

        /* istanbul ignore if */
        if (!isNaN(newPage)) {
          if (newPage < 1) {
            newPage = 1;
          }

          if (newPage > pageCount) {
            newPage = pageCount;
          }
        }

        if (newPage !== currentPage) {
          this.$emit('change', newPage);
        }
      },

      onMouseenter(direction) {
        if (this.disabled) return;
        if (direction === 'left') {
          this.quickprevIconClass = 'el-icon-d-arrow-left';
        } else {
          this.quicknextIconClass = 'el-icon-d-arrow-right';
        }
      }
    },

    computed: {
      pagers() {
        const pagerCount = this.pagerCount;
        const halfPagerCount = (pagerCount - 1) / 2;

        const currentPage = Number(this.currentPage);
        const pageCount = Number(this.pageCount);

        let showPrevMore = false;
        let showNextMore = false;

        if (pageCount > pagerCount) {
          if (currentPage > pagerCount - halfPagerCount) {
            showPrevMore = true;
          }

          if (currentPage < pageCount - halfPagerCount) {
            showNextMore = true;
          }
        }

        const array = [];

        if (showPrevMore && !showNextMore) {
          const startPage = pageCount - (pagerCount - 2);
          for (let i = startPage; i < pageCount; i++) {
            array.push(i);
          }
        } else if (!showPrevMore && showNextMore) {
          for (let i = 2; i < pagerCount; i++) {
            array.push(i);
          }
        } else if (showPrevMore && showNextMore) {
          const offset = Math.floor(pagerCount / 2) - 1;
          for (let i = currentPage - offset ; i <= currentPage + offset; i++) {
            array.push(i);
          }
        } else {
          for (let i = 2; i < pageCount; i++) {
            array.push(i);
          }
        }

        this.showPrevMore = showPrevMore;
        this.showNextMore = showNextMore;

        return array;
      }
    },

    data() {
      return {
        current: null,
        showPrevMore: false,//是否显示前面更多
        showNextMore: false,//是否显示后面更多
        quicknextIconClass: 'el-icon-more',
        quickprevIconClass: 'el-icon-more'
      };
    }
  };
</script>
