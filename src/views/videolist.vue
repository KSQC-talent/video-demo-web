<template>
  <div class="video-list-container">
    <div class="page-title">视频列表</div>

    <!-- 视频列表区域 -->
    <div class="video-card-wrap">
      <!-- 列表数据渲染 -->
      <div class="video-card" v-for="item in videoList" :key="item.id">
        <div>
            <img class="video-pic"
            :src="`/pics/${item.id}.png`" 
            @error="handleImgError($event)"
            @click="goTo(item.id)"
          />
        </div>
        <div class="video-name" @click="goTo(item.id)">{{ item.videoName }}</div>
      </div>
      
      <!-- 空数据兜底 -->
      <div class="empty-data" v-if="videoList.length === 0">暂无视频数据</div>
    </div>

    <!-- 分页组件 - 放在页面底部 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pageParams.current"
        v-model:page-size="pageParams.size"
        :page-sizes="[1, 5, 10, 20]"
        :total="pageInfo.total"
        :disabled="loading"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="getVideoList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router';

const router = useRouter();

const goTo = (videoId) => {
     router.push({
        path: '/video',
        query: { id: videoId } // 把视频id通过【url参数】传递，格式：/video?id=test 或 /video?id=test2
    });
}
// 1. 列表数据 & 加载状态
const videoList = ref([]) // 视频列表数组，对应JSON的records
const loading = ref(false) // 加载中状态，防止重复请求

// 2. 分页参数 - 与后端JSON字段完全对应
const pageParams = reactive({
  current: 1, // 当前页码
  size: 1,    // 每页条数，你的JSON里默认是1，对应el-pagination的page-size
})

// 3. 分页总信息 - 与后端JSON字段完全对应
const pageInfo = reactive({
  total: 0,   // 总条数
  pages: 0    // 总页数
})

// 4. 获取视频列表数据（核心请求方法）
const getVideoList = async () => {
  try {
    loading.value = true
    // ✅ 后端请求前缀已配置 /api ，接口地址直接拼接即可
    const { data } = await axios.get('/api/video/getVideoPage', {
      params: pageParams // 传分页参数：current + size
    })
    // ✅ 解构后端返回的JSON数据，与你提供的结构完全匹配
    const { records, total, size, current, pages } = data
    videoList.value = records // 赋值列表数据
    // 更新分页信息
    pageInfo.total = total
    pageInfo.pages = pages
    pageParams.size = size
    pageParams.current = current
  } catch (error) {
    ElMessage.error('视频列表加载失败，请稍后重试')
    console.error('请求失败：', error)
  } finally {
    loading.value = false
  }
}

// 5. 监听每页条数改变
const handleSizeChange = () => {
  // 切换每页条数时，默认回到第一页并重新请求
  pageParams.current = 1
  getVideoList()
}

// 6. 页面挂载完成后，初始化加载列表数据
onMounted(() => {
  getVideoList()
})
</script>

<style scoped>
.video-list-container {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}
.video-card-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}
.video-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.video-pic {
  width: 100%;
  height: 100%;
  text-align: center;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  background-color: #f5f7fa;
}
.video-name {
  color: #165DFF;
  font-size: 16px;
  font-weight: 500;
}
.empty-data {
  width: 100%;
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}
.pagination-wrap {
  text-align: right;
}
</style>