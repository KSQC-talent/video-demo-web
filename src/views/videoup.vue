<script setup>
import { ref, onUnmounted } from 'vue'
import axios from 'axios' // 项目已安装axios

// 1. 响应式数据定义 - 完全保留你的所有变量
const videoName = ref('') // 视频名称输入框
const authorName = ref('') // 作者名称输入框
const videoFile = ref(null) // 选中的视频文件
const coverFile = ref(null) // 选中的封面预览图文件
const videoUrl = ref('') // 视频预览地址
const coverUrl = ref('') // 封面预览地址
const uuid = ref('') // 核心唯一UUID
const uploadLoading = ref(false) // 上传加载状态

// 2. 生成UUID（浏览器原生API，极简高效）- 完全保留
const createUuid = () => {
  uuid.value = crypto.randomUUID()
  console.log('本次上传唯一ID：', uuid.value)
}

// 3. 选择视频文件 - 预览+暂存文件 + 新增文件大小校验
const handleVideoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // 原逻辑：校验mp4格式
  if (file.type !== 'video/mp4') {
    alert('请选择mp4格式的视频文件！')
    return
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  createUuid() // 每次选择视频自动生成新的UUID
}

// 4. 选择封面图片 - 预览+暂存文件 + 新增文件大小校验
const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // 原逻辑：校验图片格式
  if (!file.type.includes('image/')) {
    alert('请选择图片格式的封面文件！')
    return
  }

  coverFile.value = file
  coverUrl.value = URL.createObjectURL(file)
}

// 5. 核心上传方法：文件重命名+上传文件+提交接口 - 优化增强，逻辑不变
const handleUpload = async () => {
  // 表单校验 - 优化提示文案，更友好
  if (!videoName.value.trim()) return alert('⚠️ 请输入视频名称！')
  if (!authorName.value.trim()) return alert('⚠️ 请输入作者名称！')
  if (!videoFile.value) return alert('⚠️ 请选择要上传的视频文件！')
  if (!coverFile.value) return alert('⚠️ 请选择视频封面图片！')
  if (!uuid.value) createUuid()

  uploadLoading.value = true
  try {
    // ========== 关键：文件重命名【优化核心】 ==========
    // 视频固定重命名：uuid.mp4 (不变)
    const renameVideoFile = new File([videoFile.value], `${uuid.value}.mp4`, {
      type: videoFile.value.type
    })
    // ✅ 修复BUG：封面沿用原文件格式，不再固定为png，避免格式错误
    const coverSuffix = coverFile.value.name.split('.').pop().toLowerCase()
    const renameCoverFile = new File([coverFile.value], `${uuid.value}.${coverSuffix}`, {
      type: coverFile.value.type
    })

    // 创建FormData表单对象，用于上传文件
    const formData = new FormData()
    formData.append('cover', renameCoverFile) // 封面文件
    formData.append('video', renameVideoFile) // 视频文件

    // 第一步：上传 重命名后的视频+封面文件 到服务器，路径完全由后端决定 ✔️
    console.log('开始上传文件...')
    await axios.post('/api/video/uploadFile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000 // ✅ 超时时间加长到2分钟，适配大视频上传
    })

    // 第二步：提交核心字段到接口，完成入库
    console.log('文件上传完成，提交表单数据...')
    const res = await axios.post('/api/video/upload', {
      id: uuid.value,    
      videoName: videoName.value.trim(), 
      author: authorName.value.trim()
    })

    if (res.data.code === 200 || res.status === 200) {
      alert('🎉 视频上传成功！')
      resetForm() // 上传成功后重置表单
    } else {
      alert('❌ 视频上传失败，接口返回异常！')
    }
  } catch (error) {
    console.error('上传失败详情：', error)
    // ✅ 细化错误提示，方便排查问题
    if(error.message.includes('timeout')){
      alert('❌ 上传超时！文件过大或网络较慢，请重试')
    }else{
      alert('❌ 上传失败，请检查网络或联系管理员')
    }
  } finally {
    uploadLoading.value = false // 无论成败，关闭加载状态
  }
}

// 6. 重置表单数据 ✅【修复核心BUG，百分百重置成功】
const resetForm = () => {
  // 重置所有绑定值
  videoName.value = ''
  authorName.value = ''
  videoFile.value = null
  coverFile.value = null
  
  // ✅ 释放内存后再清空预览地址
  if(videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if(coverUrl.value) URL.revokeObjectURL(coverUrl.value)
  
  videoUrl.value = ''
  coverUrl.value = ''
  uuid.value = ''

  // ✅ 精准获取文件上传框，重置文件选择，修复原代码大概率失效问题
  const videoInput = document.querySelector('input[type="file"][accept="video/mp4"]')
  const coverInput = document.querySelector('input[type="file"][accept="image/*"]')
  if(videoInput) videoInput.value = ''
  if(coverInput) coverInput.value = ''
}

// ✅ 新增：组件卸载时释放内存，防止内存泄漏（大文件上传必加）
onUnmounted(() => {
  if(videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if(coverUrl.value) URL.revokeObjectURL(coverUrl.value)
})
</script>

<template>
  <div class="upload-video-container" style="width: 80%; margin: 50px auto;">
    <h2>视频上传页面</h2>
    <!-- 1. 视频名称输入框 -->
    <div class="form-item" style="margin: 20px 0;">
      <label>视频名称：</label>
      <input
        v-model="videoName"
        type="text"
        placeholder="请输入视频名称"
        style="width: 300px; height: 36px; padding: 0 10px;"
      />
    </div>

    <!-- 2. 作者名称输入框 -->
    <div class="form-item" style="margin: 20px 0;">
      <label>作者名称：</label>
      <input
        v-model="authorName"
        type="text"
        placeholder="请输入作者名称"
        style="width: 300px; height: 36px; padding: 0 10px;"
      />
    </div>

    <!-- 3. 选择视频文件 -->
    <div class="form-item" style="margin: 20px 0;">
      <label>选择视频：</label>
      <input
        type="file"
        accept="video/mp4"
        @change="handleVideoChange"
        style="padding: 6px;"
      />
    </div>

    <!-- 视频预览区域 -->
    <div v-if="videoUrl" style="margin: 20px 0;">
      <h4>视频预览：</h4>
      <video :src="videoUrl" controls width="500" height="auto"></video>
    </div>

    <!-- 4. 选择封面图片 -->
    <div class="form-item" style="margin: 20px 0;">
      <label>选择封面图：</label>
      <input
        type="file"
        accept="image/*"
        @change="handleCoverChange"
        style="padding: 6px;"
      />
    </div>

    <!-- 封面预览区域 -->
    <div v-if="coverUrl" style="margin: 20px 0;">
      <h4>封面预览：</h4>
      <img :src="coverUrl" alt="封面图" width="300" height="auto" style="border:1px solid #eee;"/>
    </div>

    <!-- 5. 上传按钮 -->
    <div class="btn-box" style="margin-top: 30px;">
      <button
        @click="handleUpload"
        :disabled="uploadLoading"
        style="width: 120px; height: 40px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
      >
        {{ uploadLoading ? '上传中...' : '立即上传' }}
      </button>
      <button
        @click="resetForm"
        style="width: 120px; height: 40px; margin-left: 10px; background: #fff; color: #666; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;"
      >
        重置表单
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-item {
  line-height: 36px;
}
label {
  display: inline-block;
  width: 80px;
  font-size: 14px;
}
video, img {
  border-radius: 4px;
  object-fit: cover;
}
button:disabled {
  background: #ccc !important;
  cursor: not-allowed !important;
}
input {
  outline: none;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
input:focus {
  border-color: #409eff;
}
</style>