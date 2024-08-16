import { defineStore } from "pinia";
import defaultBookmark from "@/assets/defaultBookmark";

const useSiteDataStore = defineStore("siteData", {
  state: () => {
    return {
      // 书签数据
      bookmarkData: null,
    };
  },
  actions: {
    setBookmarkData(value) {
      this.bookmarkData = value;
    },
    // 恢复数据
    recoverBookmarkData(data) {
      let isSuccess = false;
      try {
        this.bookmarkData = data;
        isSuccess = true;
      } catch (error) {
        console.error("书签数据恢复时处理失败：", error);
        isSuccess = false;
      }
      return isSuccess;
    },
  },
  // 开启数据持久化
  persist: {
    key: "siteData",
    storage: window.localStorage,
    afterRestore: (ctx) => {
      if (!ctx.store.$state.bookmarkData || Object.keys(ctx.store.$state.bookmarkData).length === 0) {
        ctx.store.$state.bookmarkData = defaultBookmark;
      }
    },
  },
});

export default useSiteDataStore;
