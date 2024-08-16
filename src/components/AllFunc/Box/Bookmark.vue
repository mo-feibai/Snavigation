<template>
  <!-- 书签 -->
  <Transition name="fade" mode="out-in">
    <div v-if="bookmarkData && Object.keys(bookmarkData).length > 0" class="bookmark">
      <n-scrollbar class="scrollbar">
        <n-grid
          class="all-bookmark"
          responsive="screen"
          cols="2 s:3 m:4 l:5"
          :x-gap="10"
          :y-gap="10"
        >
          <n-grid-item
            v-for="item in bookmarks"
            :key="item"
            class="bookmark-item"
            @contextmenu="bookmarkContextmenu($event, item)"
            @click="bookmarkJump(item.url)"
          >
            <span class="name">{{ item.name }}</span>
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
import { NButton, NGrid, NGridItem, NScrollbar } from "naive-ui";
import { storeToRefs } from "pinia";
import { setStore, siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";
import OperationModal from "@/components/AllFunc/Box/OperationModal.vue";
import { OperationSender } from "@/entity/enum.js";

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
const bookmarkContextmenu = (e, data) => {
  operationModal.value.operationContextmenu(e, data);
};

// 书签跳转
const bookmarkJump = (url) => {
  const urlRegex = /^(https?:\/\/)/i;
  const urlFormat = urlRegex.test(url) ? url : `//${url}`;
  if (set.urlJumpType === "href") {
    window.location.href = urlFormat;
  } else if (set.urlJumpType === "open") {
    window.open(urlFormat, "_blank");
  }
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
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--main-background-light-color);
      border-radius: 8px;
      font-size: 16px;
      transition: background-color 0.3s,
      box-shadow 0.3s;

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
        box-shadow: 0 0 0px 2px var(--main-background-hover-color);
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
