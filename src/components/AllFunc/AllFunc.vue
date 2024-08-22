<template>
  <!-- 功能区 -->
  <div
    :class="status.mainBoxBig ? 'main-box big' : 'main-box'"
    @click.stop
    @contextmenu.stop="
      (e) => {
        e.preventDefault();
      }
    "
  >
    <Transition name="fade" mode="out-in">
      <AllBox v-if="status.siteStatus === 'box'" />
      <AllSet v-else-if="status.siteStatus === 'set'" />
    </Transition>
  </div>
</template>

<script setup>
import { setStore, siteStore, statusStore } from "@/stores";
import AllBox from "@/components/AllFunc/AllBox.vue";
import AllSet from "@/components/AllFunc/AllSet.vue";
import { BookmarkSort } from "@/entity/enum.js";
import { watchPostEffect } from "vue";
import { storeToRefs } from "pinia";

const status = statusStore();
const site = siteStore();
const set = setStore();

const { bookmarkData } = storeToRefs(site);

const bookmarkSorting = (bookmarkData) => {
  if (!bookmarkData || Object.keys(bookmarkData).length === 0) {
    return;
  }
  // 遍历书签数据
  for (const key in bookmarkData) {
    const bookmarks = bookmarkData[key]["bookmarks"];
    if (!bookmarks || bookmarks.length === 0) {
      continue;
    }
    bookmarks.sort((a, b) => {
      if (BookmarkSort.ALPHABETICAL_ORDER === set.bookmarkSort) {
        return a.name.localeCompare(b.name); // name升序
      } else if (BookmarkSort.ADD_TIME === set.bookmarkSort) {
        return a.id - b.id; // id升序
      } else {
        if (a.visits !== b.visits) {
          return (b.visits ?? 0) - (a.visits ?? 0); // visits降序
        } else {
          return a.name.localeCompare(b.name); // name升序
        }
      }
    });
  }
};

// 监听书签排序修改
watchPostEffect(() => {
  bookmarkSorting(bookmarkData.value);
});
</script>

<style lang="scss" scoped>
.main-box {
  position: absolute;
  width: 80%;
  height: 64vh;
  max-width: 1200px;
  background-color: var(--main-background-light-color);
  backdrop-filter: blur(20px);
  color: var(--main-text-color);
  border-radius: 8px;
  transition: opacity 0.3s,
  transform 0.3s,
  margin-top 0.3s,
  height 0.3s;
  z-index: 2;

  .all-set {
    overflow: hidden;
    height: 100%;

    :deep(.scrollbar) {
      max-height: calc(64vh - 84px);
      transition: max-height 0.3s;
    }

    :deep(.set-item) {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 12px;
      border: none;
      box-shadow: var(--main-box-shadow);
      --n-color: var(--main-background-light-color);

      .n-card__content {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;

        .desc {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          @media (max-width: 720px) {
            flex-direction: column;
            align-items: flex-start;
            .name {
              margin-bottom: 8px;
            }
          }
        }

        .name {
          display: flex;
          flex-direction: column;

          .title {
            font-size: 16px;
          }

          .tip {
            font-size: 13px;
            opacity: 0.8;
          }
        }

        .set {
          width: 200px;
          @media (max-width: 768px) {
            width: 140px;
            min-width: 140px;
          }
        }

        .set-multi {

          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          @media (max-width: 720px) {
            align-items: flex-start;
            .name {
              margin-bottom: 8px;
            }
          }
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .all-box {
    overflow: hidden;
    height: 100%;

    :deep(.n-tab-pane) {
      .scrollbar {
        max-height: calc(80vh - 84px);
      }

      .not-bookmark {
        min-height: calc(64vh - 84px);
      }

      &.no-padding {
        .scrollbar {
          max-height: calc(64vh - 44px);
        }
      }
    }


    :deep(.tab-template) {
      display: flex;
      gap: max(1%, 6px);
      height: 100%;
      justify-content: center;
      align-items: center;

      .tab-icon, .tab-name {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: center;
      }

      .tab-icon {
        .n-avatar {
          background-color: var(--main-background-light-color);
        }
      }
    }
  }


  &.big {
    height: 80%;
    margin-top: 0 !important;

    :deep(.scrollbar) {
      max-height: calc(80vh - 84px);
    }
  }

  @media (max-width: 478px) {
    height: 60vh;
  }
}
</style>
