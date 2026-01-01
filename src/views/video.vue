<template>
  <!-- 外层全屏flex容器：核心！实现水平+垂直居中 -->
  <div class="player-center-box">
    <!-- 你的DPlayer挂载容器，保留原有宽高540*960不变 -->
    <div id="dplayer" style="width: 540px; height: 960px"></div>
  </div>
</template>

<script>
import DPlayer from 'dplayer'

export default {
  name: 'VideoPlayer',
  data() {
    return {
      dp: null,
      videoId: '' // 存储当前播放的视频ID
    }
  },
  mounted() {
    // 1. 获取路由传过来的视频ID
    this.getVideoId()
    // 2. 根据ID初始化播放器，播放对应视频
    this.initPlayer()
  },
  beforeDestroy() {
    // 优化销毁：防止播放器实例内存泄漏
    this.dp && this.dp.destroy()
    this.dp = null
  },
  methods: {
    // ✅ 核心：获取路由中传递的视频id
    getVideoId() {
      // 接收列表页通过 query 传过来的id 例如：/video?id=test
      this.videoId = this.$route.query.id || ''
    },
    // ✅ 核心：初始化DPlayer，根据ID拼接视频播放路径
    initPlayer() {
      this.dp = new DPlayer({
        container: document.getElementById('dplayer'),
        autoplay: false,
        theme: '#FADFA3',
        loop: true,
        lang: 'zh-cn',
        video: {
          // 关键修改：拼接路径 /videos/你的id.mp4
          url: `/videos/${this.videoId}.mp4`,
          type: 'auto'
        }
      })
    }
  }
}
</script>

<style>
.player-center-box {
  width: 100vw; 
  height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  margin: 0;
  padding: 0;
}
/* 解决播放器容器可能的间距问题 */
#dplayer {
  line-height: 0;
}
</style>