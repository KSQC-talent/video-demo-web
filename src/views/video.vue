<template>
  <!-- 外层全屏flex容器：核心！实现水平+垂直居中 -->
  <div class="player-center-box" >
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
      dp: null
    }
  },
  mounted() {
    this.dp = new DPlayer({
      container: document.getElementById('dplayer'),
      autoplay: false,
      theme: '#FADFA3',
      loop: true,
      lang: 'zh-cn',
      video: {
        url: '/videos/test.mp4',
        type: 'auto'
      }
    })
  },
  beforeDestroy() {
    this.dp && this.dp.destroy()
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
}
</style>