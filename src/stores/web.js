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

    return { web, users, userAdd }
},{
    persist:true
})
