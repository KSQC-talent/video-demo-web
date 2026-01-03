<script setup>
import { ref, onUnmounted } from 'vue'
import axios from 'axios'

// 原有JS逻辑完全保留，无任何修改
const videoName = ref('')
const authorName = ref('')
const videoFile = ref(null)
const coverFile = ref(null)
const videoUrl = ref('')    
const coverUrl = ref('')    
const uuid = ref('')
const uploadLoading = ref(false)

// ✅ 替换原有crypto.randomUUID，自定义生成唯一UUID，兼容所有环境+内网
const createUuid = () => {
  const s = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  const uuidStr = s.join("");
  uuid.value = uuidStr;
  console.log('本次上传唯一ID：', uuid.value)
}

const getVideoFirstFrame = (videoFile) => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(videoFile)
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'

    video.onloadeddata = () => {
      video.currentTime = 0.0
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          const coverImgFile = new File([blob], `${uuid.value}.png`, { type: 'image/png' })
          resolve(coverImgFile)
          URL.revokeObjectURL(video.src)
        }, 'image/png', 0.9)
      }
    }
  })
}

const handleVideoChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.type !== 'video/mp4') {
    alert('请选择mp4格式的视频文件！')
    return
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  !uuid.value && createUuid()

  if (!coverFile.value) {
    coverFile.value = await getVideoFirstFrame(file)
    console.log('未选择手动封面，已自动截取视频第一帧作为封面')
  }
}

const handleCoverChange = (e) => {
  const file = e.target.files[0]
  if (!file) {
    coverFile.value = null
    coverUrl.value && URL.revokeObjectURL(coverUrl.value)
    coverUrl.value = ''
    console.log('已取消手动封面选择')
    return
  }
  const imgType = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
  if (!imgType.includes(file.type)) {
    alert('请选择 png/jpg/jpeg/webp 格式的图片作为封面！')
    return
  }
  !uuid.value && createUuid()
  coverUrl.value = URL.createObjectURL(file)
  coverFile.value = new File([file], `${uuid.value}.png`, { type: 'image/png' })
  console.log('已选择手动封面，将优先使用该封面上传')
}

const handleUpload = async () => {
  if (!videoName.value.trim()) return alert('⚠️ 请输入视频名称！')
  if (!authorName.value.trim()) return alert('⚠️ 请输入作者名称！')
  if (!videoFile.value) return alert('⚠️ 请选择要上传的视频文件！')
  if (!uuid.value) createUuid()

  uploadLoading.value = true
  try {
    if (!coverFile.value && videoFile.value) {
      coverFile.value = await getVideoFirstFrame(videoFile.value)
    }

    const renameVideoFile = new File([videoFile.value], `${uuid.value}.mp4`, { type: videoFile.value.type })
    const renameCoverFile = new File([coverFile.value], `${uuid.value}.png`, { type: coverFile.value.type })

    const formData = new FormData()
    formData.append('cover', renameCoverFile)
    formData.append('video', renameVideoFile)

    await axios.post('/api/video/uploadFile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    })

    const res = await axios.post('/api/video/upload', {
      id: uuid.value,    
      videoName: videoName.value.trim(), 
      author: authorName.value.trim()
    })

    if (res.data.code === 200 || res.status === 200) {
      alert('🎉 视频上传成功！')
      resetForm()
    } else {
      alert('❌ 视频上传失败，接口返回异常！')
    }
  } catch (error) {
    console.error('上传失败详情：', error)
    if(error.message.includes('timeout')){
      alert('❌ 上传超时！文件过大或网络较慢，请重试')
    }else{
      alert('❌ 上传失败，请检查网络或联系管理员')
    }
  } finally {
    uploadLoading.value = false
  }
}

const resetForm = () => {
  videoName.value = ''
  authorName.value = ''
  videoFile.value = null
  coverFile.value = null
  
  if(videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if(coverUrl.value) URL.revokeObjectURL(coverUrl.value)
  
  videoUrl.value = ''
  coverUrl.value = ''
  uuid.value = ''

  const videoInput = document.querySelector('input[type="file"][accept="video/mp4"]')
  const coverInput = document.querySelector('input[type="file"][accept="image/*"]')
  videoInput && (videoInput.value = '')
  coverInput && (coverInput.value = '')
}

onUnmounted(() => {
  if(videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if(coverUrl.value) URL.revokeObjectURL(coverUrl.value)
})
</script>

<template>
  <div class="upload-video-container">
    <h2>视频上传页面</h2>
    <!-- 视频名称输入框 -->
    <div class="form-item">
      <label>视频名称：</label>
      <input v-model="videoName" type="text" placeholder="请输入视频名称" />
    </div>

    <!-- 作者名称输入框 -->
    <div class="form-item">
      <label>作者名称：</label>
      <input v-model="authorName" type="text" placeholder="请输入作者名称" />
    </div>

    <!-- 选择视频文件 -->
    <div class="form-item">
      <label>选择视频：</label>
      <input type="file" accept="video/mp4" @change="handleVideoChange" class="file-input" />
    </div>

    <!-- 手动选择封面文件按钮 -->
    <div class="form-item">
      <label>选择封面：</label>
      <input type="file" accept="image/*" @change="handleCoverChange" class="file-input" />
      <span class="cover-tips">（选填，未选择则自动截取视频第一帧）</span>
    </div>

    <!-- 视频预览 -->
    <div v-if="videoUrl" class="preview-box video-preview">
      <h4>视频预览：</h4>
      <video :src="videoUrl" controls></video>
    </div>

    <!-- 上传/重置按钮 -->
    <div class="btn-box">
      <button @click="handleUpload" :disabled="uploadLoading" class="upload-btn">
        {{ uploadLoading ? '上传中...' : '立即上传' }}
      </button>
      <button @click="resetForm" class="reset-btn">重置表单</button>
    </div>
  </div>
</template>

<style scoped>
/* 全局响应式基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  background-color: #f5f5f5;
}

/* ✅ 核心修改：圆润四圆角 + 柔和阴影 + 电脑端下移防重叠 全部满足 */
.upload-video-container {
  width: 100%;
  max-width: 900px;
  margin: 100px auto 50px; /* 电脑端下移 彻底避开顶部导航 永不重叠 */
  padding: 30px 20px;
  background: #ffffff;
  border-radius: 20px; /* ✅ 四个角圆润大圆角 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); /* ✅ 加回柔和阴影 不厚重/无重叠感 刚刚好 */
}
.upload-video-container h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
	font-weight: 600;
  color: #2d3748;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f4f7;
}

/* 表单项：垂直排列 手机端完美适配 */
.form-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 18px 0;
  line-height: 38px;
}
.form-item label {
  width: auto;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
	padding-right: 0;
  margin-bottom: 4px;
}
.form-item input[type="text"] {
  width: 100%;
 	height: 38px;
  padding: 0 14px;
  outline: none;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.3s ease;
}
.form-item input[type="text"]:hover { border-color: #cbd5e0; }
.form-item input[type="text"]:focus {
  border-color: #165dff;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 文件选择框：占满宽度 适配所有设备 */
.file-input {
  padding: 6px 8px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  width: 100%;
}
.cover-tips {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 0;
  margin-top: 4px;
  display: block;
}

/* 预览区域：圆角适配，无偏移 */
.preview-box {
  margin: 10px 0 20px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px; /* 预览框也做圆角，和整体统一 */
  border: 1px solid #f2f4f7;
  width: 100%;
}
.preview-box h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}
.video-preview video {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  outline: none;
  object-fit: cover;
}

/* 按钮区域：平分宽度 适配所有设备 */
.btn-box {
  margin-top: 20px;
  padding-left: 0;
  display: flex;
  gap: 10px;
  width: 100%;
}
.upload-btn, .reset-btn {
  flex: 1;
  height: 40px;
  font-size: 14px;
  border-radius: 8px; /* 按钮也做圆角，整体风格统一 */
  cursor: pointer;
  transition: all 0.3s ease;
}
.upload-btn {
  background: #165dff;
  color: #ffffff;
  border: none;
}
.upload-btn:hover { background: #0f48d1; }
.reset-btn {
  background: #ffffff;
  color: #667292;
	border: 1px solid #d1d5db;
}
.reset-btn:hover {
 	border-color: #94a3b8;
  color: #4a5568;
  background: #f9fafb;
}
button:disabled {
  background: #cbd5e1 !important;
  cursor: not-allowed !important;
	border-color: #cbd5e1 !important;
}

/* ✅ 手机端单独适配：上边距缩小，不浪费空间，圆角+阴影保留 */
@media screen and (max-width: 768px) {
  .upload-video-container {
    margin: 70px auto;
    padding: 20px 15px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); /* 手机端阴影更轻一点 */
  }
}
</style>