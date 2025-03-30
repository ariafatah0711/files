import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Repo from "../views/Repo.vue";

const routes = [
  { path: "/", component: Home },
  {
    path: "/:repo/:path(.*)*",
    name: "Repo",
    component: Repo,
  },
];

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(), // Pakai HASH mode
  routes,
});

export default router;
