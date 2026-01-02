import { defineStore } from "pinia";
import { ref,reactive } from "vue";

export const useWebStore = defineStore("web", () => {
    const web = reactive({
        title: "video-web",
        URL: "www.video-web.com"
    })

    const users = ref(1000)

    const userAdd = () => {
        users.value += 1
    }  

    const videoItem = reactive({
        id: '',
        videoName: '',
        author: ''
    })

    return { web, users, userAdd, videoItem }
},{
    persist:true
})
