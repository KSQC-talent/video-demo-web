<template>
  <!-- 上下排版核心容器：顶部信息 + 底部播放器 -->
  <div class="video-player-wrap">
    <!-- 上方：视频信息区 (极简 仅标题+作者) -->
    <div class="video-info-box">
      <h2 class="video-name">{{ videoName || '暂无视频名称' }}</h2>
      <div class="video-author">UP主：{{ author || '未知上传者' }}</div>
    </div>

    <!-- 下方：播放器区域 -->
    <div class="player-box">
      <div id="dplayer"></div>
    </div>
  </div>
</template>

<script>
import DPlayer from 'dplayer'
import { useWebStore } from '@/stores/web.js';

const webStore = useWebStore();

export default {
  name: 'VideoPlayer',
  data() {
    return {
      dp: null,
      videoId: '',
      videoName: '',
      author: ''
    }
  },
  mounted() {
    this.getVideoId()
    this.initPlayer()
  },
  beforeDestroy() {
    this.dp && this.dp.destroy()
    this.dp = null
  },
  methods: {
    getVideoId() {
      this.videoId = webStore.videoItem.id || ''
      this.videoName = webStore.videoItem.videoName || ''
      this.author = webStore.videoItem.author || ''
    },
    initPlayer() {
      this.dp = new DPlayer({
        container: document.getElementById('dplayer'),
        autoplay: false,
        theme: '#FADFA3', // 保留原主题色
        loop: true,
        lang: 'zh-cn',
        video: {
          url: `/videos/${this.videoId}.mp4`,
          type: 'auto'
        }
      })
    }
  }
}
</script>

<style scoped>
/* 全局重置 清除默认边距 一屏完整显示 无滚动条 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f2f2f2;
}

/* 核心：上下垂直排版 整体居中 间距适中 铺满页面不溢出 */
.video-player-wrap {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
  padding: 30px 20px;
}

/* 上方：视频信息区 极简纯白卡片 适配播放器宽度 */
.video-info-box {
  width: 320px;
  padding: 20px 25px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  text-align: center;
}
.video-name {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 10px;
}
.video-author {
  font-size: 16px;
  color: #555;
}

/* 下方：播放器区域 缩小优化尺寸 刚好适配页面 不超出 */
.player-box {
  width: 320px;
  height: 570px;
}
#dplayer {
  width: 100% !important;
  height: 100% !important;
  line-height: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}
</style>