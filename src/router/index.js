import { createRouter,createWebHistory } from "vue-router";


const routes = [
    {
        path: "/",
        alias:["/home","/index"],
        component: () => import("../views/index.vue")
    },
    {
        path: "/content",
        component: () => import("../views/content.vue")
    },
    {
        path: "/video",
        component: () => import("../views/video.vue")
    },
    {
        path: "/user/:id",
        component: () => import("../views/user.vue")
    },
    {
        path:"/test",
        redirect:"/video"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;