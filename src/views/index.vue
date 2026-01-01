<script setup>
    import { useRouter } from 'vue-router';

    const router = useRouter();

    const goTo = () => {
        router.push('/content');
    }
</script>

<template>
index
<br>
<router-link to="/content">内容页</router-link>
<br>
<router-link to="/videolist">视频页</router-link>
<br>
<router-link to="/user/123">用户页</router-link>
<br>
<router-link :to="{path:'/content',query:{id:123}}">动态</router-link>

<button @click="goTo">跳转到内容页</button>
</template>

<style scoped>

</style>