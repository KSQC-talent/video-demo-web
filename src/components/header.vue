<script setup>
</script>

<template>
  <!-- ✅ 顶部固定导航栏 上边栏容器 - 核心改造点 -->
  <div class="sidebar-container">
    <div class="sidebar-content">
      <!-- 平台标题 -->
      <h3 class="sidebar-title">视频平台</h3>
      <!-- 导航链接 - 垂直变水平布局 -->
      <div class="nav-links">
        <router-link to="/videolist" class="nav-link">视频列表</router-link>
        <router-link to="/videoup" class="nav-link">上传视频</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ 核心：顶部固定上边栏 - 置顶+全屏宽度+固定高度+不滚动+层级置顶 */
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px; /* 顶部栏高度 */
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 999; /* 置顶，防止被其他内容遮挡 */
  box-sizing: border-box;
  overflow: hidden;
}

/* 侧边栏内容容器 - 内部间距+水平居中布局 */
.sidebar-content {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 30px;
}

/* 标题样式 - 字号微调+取消居中+无下边距 */
.sidebar-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

/* 导航链接父容器 - 水平弹性布局 核心改造点 */
.nav-links {
  display: flex;
  flex-direction: row; /* 垂直改水平 */
  gap: 8px;
  align-items: center;
  height: 100%;
}

/* 路由导航链接美化 + 高亮 + hover 效果 - 适配顶部导航 完美复用原有配色 */
.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-size: 15px;
  padding: 8px 18px;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  display: inline-block;
}
/* 鼠标悬浮效果 - 背景变色+字体变色 不变 */
.nav-link:hover {
  color: #165dff;
  background-color: rgba(22, 93, 255, 0.05);
}
/* 路由激活样式（vue-router 自带类名）- 高亮选中 不变 */
.nav-link.router-link-active {
  color: #165dff;
	font-weight: 500;
  background-color: rgba(22, 93, 255, 0.08);
}
/* ✅ 适配顶部导航：激活/悬浮时 底部横线装饰 (替代左侧竖线，完美适配) */
.nav-link.router-link-active::after,
.nav-link:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  width: 100%;
  background-color: #165dff;
  border-radius: 3px;
}

/* ✅ 核心适配：给页面主体加上边距，防止内容被顶部导航栏遮挡 */
:root body {
  padding-top: 60px; /* 和顶部栏高度一致 */
  margin: 0;
}
</style>