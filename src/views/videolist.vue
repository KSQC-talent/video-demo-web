<template>
  <div class="video-list-container">
    <!-- ✅ 顶部搜索栏 + 标题 + 统计条数 一行布局 -->
    <div class="header-wrap">
      <div class="page-title">视频列表</div>
      <!-- 搜索框 -->
      <div class="search-wrap">
        <input 
          v-model="searchInputVal" 
          type="text" 
          placeholder="请输入视频名称搜索" 
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
      <!-- ✅ 显示共多少条视频 -->
      <div class="total-count">共 {{ pageInfo.total }} 条视频</div>
    </div>

    <!-- ✅ 搜索关键词展示 -->
    <div class="search-tips" v-if="searchKeyword">
      搜索结果：<span class="search-keyword">{{ searchKeyword }}</span>
    </div>

    <!-- 视频列表区域 -->
    <div class="video-card-wrap">
      <!-- 列表数据渲染 -->
      <div class="video-card" v-for="item in videoList" :key="item.id">
        <div class="pic-box">
          <img class="video-pic"
            :src="`/pics/${item.id}.png`" 
            @error="handleImgError($event)"
            @click="goTo(item)"
          />
        </div>
        <!-- 视频信息 + 删除按钮 水平左右排列 同一行 -->
        <div class="video-bottom-wrap">
          <div class="video-info-wrap">
            <div class="video-name" @click="goTo(item)">{{ item.videoName }}</div>
            <div class="video-author" @click="goTo(item)">{{ item.author }}</div>
          </div>
          <button class="del-btn" @click.stop="handleDelete(item.id)">删除</button>
        </div>
      </div>
      
      <!-- 空数据兜底 -->
      <div class="empty-data" v-if="videoList.length === 0">
        {{ searchKeyword ? '暂无匹配【' + searchKeyword + '】的视频' : '暂无视频数据' }}
      </div>
    </div>

    <!-- 分页组件 - 纯净版 无任何文字，只有上下页+页码 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pageParams.current"
        :page-size="pageParams.size"
        :total="pageInfo.total"
        :disabled="loading"
        layout="prev, pager, next"
        @current-change="getVideoList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router';
import { useWebStore } from '@/stores/web.js';

const router = useRouter();
const route = useRoute();
const webStore = useWebStore();

const goTo = (item) => {
    webStore.videoItem = item;
    console.log('点击的视频项：', webStore.videoItem);
    router.push({
      path: '/video',
      query:{ id: item.id }
  });
}
// 1. 列表数据 & 加载状态
const videoList = ref([])
const loading = ref(false)
// 搜索输入框绑定值
const searchInputVal = ref('')
// 搜索关键字，从路由参数中获取
const searchKeyword = ref('')

// 2. 分页参数 - 固定每页20条，永不修改
const pageParams = reactive({
  current: 1, // 当前页码
  size: 20,    // 每页固定展示20条视频
})

// 3. 分页总信息
const pageInfo = reactive({
  total: 0,
  pages: 0
})

// 重构核心：获取视频列表 (兼容搜索+无搜索)
const getVideoList = async () => {
  try {
    loading.value = true
    let resData = null
    // 获取url上的搜索关键字
    const keyword = route.query.keyword?.trim() || ''
    searchKeyword.value = keyword
    // 同步搜索框值和搜索关键词一致
    searchInputVal.value = keyword

    if (keyword) {
      // 有搜索关键字：调用搜索接口 带分页+关键字
      resData = await axios.get('/api/video/selectByName', {
        params: {
          keyword: keyword, // 搜索关键字
          current: pageParams.current,
          size: pageParams.size
        }
      })
    } else {
      // 无搜索关键字：调用原列表接口
      resData = await axios.get('/api/video/getVideoPage', {
        params: pageParams
      })
    }

    const { records, total, size, current, pages } = resData.data
    videoList.value = records
    pageInfo.total = total
    pageInfo.pages = pages
    pageParams.size = size
    pageParams.current = current
  } catch (error) {
    ElMessage.error(searchKeyword.value ? '视频搜索失败，请稍后重试' : '视频列表加载失败，请稍后重试')
    console.error('请求失败：', error)
  } finally {
    loading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  const keyword = searchInputVal.value.trim()
  // 跳转路由并携带搜索参数，触发watch重新请求列表
  router.push({
    path: route.path,
    query: keyword ? { keyword } : {}
  })
  // 搜索后重置页码到第一页
  pageParams.current = 1
}

// 删除视频方法
const handleDelete = async (id) => {
  console.log('准备删除视频ID：', id)
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该视频，是否继续？',
      '温馨提示',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await axios.get('/api/video/deleteById', { params: { id: id } })
    ElMessage.success('视频删除成功！')
    getVideoList() // 删除后刷新列表（保留搜索结果）
  } catch (error) {
    if(error !== 'cancel'){
      ElMessage.error('视频删除失败，请稍后重试')
      console.error('删除失败：', error)
    }
  }
}

// 监听路由参数变化（搜索关键字变化/进入页面），自动刷新列表
watch(() => route.query.keyword, () => {
  pageParams.current = 1; // 搜索时重置页码到第一页
  getVideoList();
}, { immediate: true })

// 封面加载失败兜底方法 (9:16比例默认图)
const handleImgError = (e) => {
  e.target.src = 'https://picsum.photos/200/356'
  e.target.style.backgroundColor = '#f9fafb'
}
</script>

<style scoped>
/* 外层容器 - 避开Header防重叠 + 同风格布局 */
.video-list-container {
  width: 100%;
  max-width: 1200px;
  margin: 90px auto 50px;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 顶部头部布局 - 标题+搜索框+统计条数 一行自适应排列 */
.header-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f2f4f7;
}
/* 标题样式 */
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  flex-shrink: 0;
}
/* 搜索框样式 - 和项目风格统一 */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 240px;
}
.search-input {
  flex: 1;
  min-width: 160px;
  height: 38px;
  padding: 0 14px;
  outline: none;
	border: 1px solid #e2e8f0;
 	border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.3s ease;
}
.search-input:hover { border-color: #cbd5e0; }
.search-input:focus {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}
.search-input::placeholder { color: #a0aec0; }
.search-btn {
  flex-shrink: 0;
  height: 38px;
  padding: 0 18px;
  background: #165dff;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}
.search-btn:hover { background: #0f48d1; }
/* 统计条数样式 */
.total-count {
  font-size: 14px;
  color: #667292;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 搜索关键词提示文字 */
.search-tips {
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 20px;
}
.search-keyword {
  color: #165dff;
  font-weight: 500;
}

/* ========== ✅ 核心修复：PC端5列，手机端自动变成2列，自适应完美 ========== */
.video-card-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

/* 视频卡片核心样式 - 悬浮动画+同风格美化 */
.video-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}
.video-card:hover {
  transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(22, 93, 255, 0.08);
  border-color: #dbeafe;
}

/* 核心：9:16比例封面容器 强制固定比例 不变形 */
.pic-box {
  width: 100%;
  padding-bottom: 177.78%; /* 9:16 精准比例 */
  border-radius: 6px;
  overflow: hidden;
  background-color: #f9fafb;
  position: relative;
  margin-bottom: 12px;
}
/* 9:16封面图 居中铺满 不变形 */
.video-pic {
  position: absolute;
	top: 0;
  left: 0;
  width: 100%;
	height: 100%;
  object-fit: cover;
  display: block;
}

/* 视频信息+删除按钮 水平左右排列 */
.video-bottom-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
/* 左侧：视频名称+作者 居左展示 */
.video-info-wrap {
  text-align: left;
  flex: 1;
  overflow: hidden;
}
.video-name {
  color: #2d3748;
	font-size: 16px;
	font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.video-author {
  color: #667292;
  font-size: 14px;
  line-height: 1.4;
}
/* 右侧：删除按钮 单独靠右 与文字同行对齐 */
.del-btn {
  padding: 4px 10px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecdd3;
  border-radius: 4px;
  cursor: pointer;
	font-size: 12px;
  transition: all 0.2s ease;
  margin-left: 8px;
  flex-shrink: 0;
}
.del-btn:hover {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

/* 空数据样式 */
.empty-data {
  width: 100%;
  text-align: center;
	padding: 80px 0;
  color: #a0aec0;
	font-size: 16px;
  background: #f9fafb;
	border-radius: 8px;
  border: 1px solid #f2f4f7;
  grid-column: 1 / -1; /* 空数据占满整行 */
}

/* 分页容器 */
.pagination-wrap {
  text-align: right;
  padding-top: 12px;
  border-top: 1px solid #f2f4f7;
}

/* 分页组件美化 同项目主色调 */
:deep(.el-pagination) {
  font-size: 14px;
}
:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  margin: 0 4px;
}
:deep(.el-pagination .el-pager li.is-active) {
  background: #165dff;
  color: #ffffff;
}
:deep(.el-pagination button:disabled) {
  color: #cbd5e0;
}

/* ========== ✅ 媒体查询 精准适配手机端 无任何折行 ========== */
@media screen and (max-width: 768px) {
  .video-list-container {
    margin: 80px auto 30px;
    padding: 0 15px;
  }
  .header-wrap {
    gap: 10px;
  }
  .page-title {
    font-size: 18px;
  }
  .search-wrap {
    gap: 6px;
    min-width: unset;
  }
  .search-input {
    height: 36px;
    font-size: 13px;
  }
  .search-btn {
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
  }
  .total-count {
    font-size: 13px;
  }
  .video-card {
    padding: 10px;
  }
}
</style>