<template>
  <div class="daily">
    <div class="daily-menu">
      <div class="daily-menu-item"
          :class="{ on: type === 'recommend' }"
          @click="handleToRecommend">每日推荐</div>
      <div class="daily-menu-item"
          :class="{ on: type === 'daily' }"
          @click="showThemes = !showThemes">主题日报</div>
      <ul v-show="showThemes">
        <li v-for="item in themes">
          <a :class="{ on: item.id === themeId && type === 'daily' }"
             @click="handleToTheme(item.id)">{{ item.name }}</a>
        </li>
      </ul>
    </div>

    <div ref="list" class="daily-list">
      <template v-if="type === 'recommend'">
        <div v-for="list in recommendList">
          <div class="daily-date">{{ formatDay(list.date) }}</div>
          <Item v-for="item in list.stories"
                :data="item"
                :key="item.id"
                @click.native="handleClick(item.id)"></Item>
        </div>
      </template>
      <template v-if="type === 'daily'">
        <Item v-for="item in list"
              :data="item"
              :key="item.id"
              @click.native="handleClick(item.id)"></Item>
      </template>
    </div>

    <daily-article :id="articleId"></daily-article>
  </div>
</template>

<script>
  import $ from './libs/util'
  import Item from './components/item.vue'
  import dailyArticle from './components/daily-article.vue'

  export default {
    components: { Item, dailyArticle },
    data () {
      return {
        themes: [],
        showThemes: false,
        themeId: 0,
        type: 'recommend',
        recommendList: [],
        list: [],
        dailyTime: $.getTodayTime(),
        isLoading: false,
        articleId: 0
      }
    },
    methods: {
      getThemes () {
        // axios 发起 get 请求
        $.ajax.get('themes').then(res => {
          this.themes = res.others
        })
      },
      handleToTheme (id) {
        this.type = 'daily'
        // 当前主题日报子类的 id
        this.themeId = id
        // 清空中间栏数据
        this.list = []

        $.ajax.get('theme/' + id).then(res => {
          // 过滤类型为 1 的文章，该类型的文章为空
          this.list = res.stories.filter(item => item.type !== 1)
        })
      },
      handleToRecommend () {
        this.type = 'recommend'
        this.recommendList = []
        this.dailyTime = $.getTodayTime()
        this.getRecommenList()
      },
      getRecommenList () {
        this.isLoading = true
        // 请求的参数 prevDay 为 20190708，但实际请求到的文章为 20190707 的
        let prevDay = $.prevDay(this.dailyTime + 86400000)

        $.ajax.get('news/before/' + prevDay).then((res) => {
          // res 会被拦截，此处为 data，查看 util.js
          console.log(res)
          this.recommendList.push(res)
          this.isLoading = false
        }) 
      },
      formatDay (date) {
        // 转换为带汉字的月日
        let month = date.substr(4, 2)
        let day = date.substr(6, 2)
        if (month.substr(0, 1) === '0') month = month.substr(1, 1)
        if (day.substr(0, 1) === '0') day = day.substr(1, 1)

        return `${month} 月 ${day} 日`
      },
      handleClick (id) {
        this.articleId = id
      }
    },
    mounted () {
      this.getThemes()
      this.getRecommenList()
      // 获取 DOM
      const $list = this.$refs.list
      // 监听中栏滚动事件，加载更多
      // 或用 vue 提供的 @scroll="handleScroll" 监听
      $list.addEventListener('scroll', () => {
        // 主题日报或正在加载推荐列表时停止操作
        if (this.type === 'daily' || this.isLoading) {
          return
        }

        // 滚动距离加上页面高度大于等于整个内容域高度时，视为接触最底部
        if ($list.scrollTop + document.body.clientHeight >= $list.scrollHeight) {
          // 时间相对倒退一天
          this.dailyTime -= 86400000
          this.getRecommenList()
        }
      })
    }
  }
</script>