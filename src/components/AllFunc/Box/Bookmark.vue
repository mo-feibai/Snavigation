<template>
  <!-- 书签 -->
  <Transition name="fade" mode="out-in">
    <div v-if="bookmarks && bookmarks.length > 0" class="bookmark">
      <n-scrollbar class="scrollbar">
        <n-grid
          class="all-bookmark"
          responsive="screen"
          cols="3 s:4 m:5 l:6"
          :x-gap="20"
          :y-gap="10"
        >
          <n-grid-item
            v-for="(item,index) in bookmarks"
            :key="index"
            class="bookmark-item"
            @contextmenu="bookmarkContextmenu($event, index)"
            @click="bookmarkJump(item.url,index)"
          >
            <div class="bookmark-avatar">
              <n-avatar
                v-if="IconType.URL === item.iconType"
                size="small"
                fallback-src="favicon.png"
                :src="(!item.iconName || item.iconName.length === 0) ? 'favicon.png' : item.iconName"
              />
              <n-avatar
                v-else
                class="avatar-icon"
                size="medium">
                {{ item.iconName ?? "无图" }}
              </n-avatar>
            </div>
            <div class="bookmark-name"><span class="name">{{ item.name }}</span></div>
          </n-grid-item>
          <n-grid-item
            class="bookmark-item"
            @contextmenu="
              (e) => {
                e.preventDefault();
              }
            "
            @click="addBookmarkModalOpen"
          >
            <SvgIcon iconName="icon-add" />
            <span class="name">添加书签</span>
          </n-grid-item>
        </n-grid>
      </n-scrollbar>
    </div>
    <div v-else class="not-bookmark">
      <span class="tip">暂无书签，去添加吧</span>
      <n-button strong secondary @click="addBookmarkModalOpen">
        <template #icon>
          <SvgIcon iconName="icon-add" />
        </template>
        添加书签
      </n-button>
    </div>
  </Transition>
  <OperationModal :operation-sender="OperationSender.BOOKMARK" :bookmark-key="props.bookmarkKey.toString()"
                  ref="operationModal" />
</template>

<script setup>
import { ref, toRef } from "vue";
import { NAvatar, NButton, NGrid, NGridItem, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore, siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";
import OperationModal from "@/components/AllFunc/Box/OperationModal.vue";
import { IconType, OperationSender } from "@/entity/enum.js";

const set = setStore();
const site = siteStore();
const { bookmarkData } = storeToRefs(site);

// 声明props
const props = defineProps(["bookmarkKey"]);

const bookmarks = toRef(bookmarkData.value[props.bookmarkKey], "bookmarks");

// 操作模态框
const operationModal = ref(null);

// 开启添加书签
const addBookmarkModalOpen = () => {
  operationModal.value.addOperationModalOpen();
};

// 开启右键菜单
const bookmarkContextmenu = (e, index) => {
  operationModal.value.operationContextmenu(e, index);
};

// 书签跳转
const bookmarkJump = (url, index) => {
  const urlRegex = /^(https?:\/\/)/i;
  const urlFormat = urlRegex.test(url) ? url : `//${url}`;
  if (set.urlJumpType === "href") {
    window.location.href = urlFormat;
  } else if (set.urlJumpType === "open") {
    window.open(urlFormat, "_blank");
  }
  // 累加访问次数
  bookmarks.value[index]["visits"] = (bookmarks.value[index]["visits"] ?? 0) + 1;
};
</script>

<style lang="scss" scoped>
.bookmark {
  width: 100%;
  height: 100%;

  .all-bookmark {
    padding: 20px;
    box-sizing: border-box;

    .bookmark-item {
      cursor: pointer;
      height: 60px;
      display: flex;
      padding: 2px 10px;
      align-items: center;
      justify-content: center;
      gap: max(calc(4%), 10px);
      background-color: var(--main-background-light-color);
      border-radius: 8px;
      font-size: 16px;
      transition: background-color 0.3s,
      box-shadow 0.3s;

      .bookmark-avatar {
        height: 100%;
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: start;

        .n-avatar {
          background-color: var(--main-background-light-color);
        }
      }

      .bookmark-name {
        height: 100%;
        flex-grow: 3;
        display: flex;
        align-items: center;
        justify-content: start;
        overflow: hidden;
      }

      .i-icon {
        width: 1rem;
        margin-right: 6px;
        font-size: 20px;
        opacity: 1;
      }

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &:hover {
        background-color: var(--main-background-hover-color);
        box-shadow: 0 0 0 2px var(--main-background-hover-color);
      }

      &:active {
        box-shadow: none;
      }
    }
  }
}

.not-bookmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tip {
    font-size: 24px;
    margin-bottom: 20px;
  }
}
</style>
