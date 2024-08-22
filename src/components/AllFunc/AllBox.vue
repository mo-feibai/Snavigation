<template>
  <div class="all-box">
    <n-tabs size="large" justify-content="space-evenly" animated tab-style="margin-right:50px"
            v-model:value="curKey" ref="tabsInstRef" type="bar">
      <template #prefix>
        <n-icon size="26" :component="Bookmarks" style="margin-left: 12px;opacity: 0.3" />
      </template>
      <n-tab-pane class="no-padding" :name="value.key" v-for="(value,key) in bookmarkData" :key="key">
        <Bookmark :bookmark-key="value.key" />
        <template #tab>
          <div class="tab-template">
            <div class="tab-icon">
              <n-icon size="1.4rem" :component="(categoryIconObj[value.iconName]??categoryIconObj['Star']).component" />
            </div>
            <div class="tab-name"><span class="name">{{ value.name }}</span></div>
          </div>
        </template>
      </n-tab-pane>
      <template #suffix>
        <div title="添加类别">
          <n-button secondary circle size="small" style="margin-right:6px" @click="addCategoryModalOpen">
            <template #icon>
              <n-icon size="18">
                <PlaylistAdd />
              </n-icon>
            </template>
          </n-button>
        </div>
        <div title="编辑类别">
          <n-button secondary circle size="small" style="margin-right:6px" @click="editCategoryModalOpen"
                    :disabled="curKey === DEFAULT_TAB_KEY">
            <template #icon>
              <n-icon size="18">
                <Edit />
              </n-icon>
            </template>
          </n-button>
        </div>
        <div title="删除类别">
          <n-button secondary circle size="small" style="margin-right:6px" @click="confirmDel"
                    :disabled="curKey === DEFAULT_TAB_KEY">
            <template #icon>
              <n-icon size="18">
                <Trash />
              </n-icon>
            </template>
          </n-button>
        </div>
      </template>
    </n-tabs>
    <OperationModal ref="operationModal" :operation-sender="OperationSender.CATEGORY"
                    :del-key="curKey?curKey.toString():''" />
  </div>
</template>

<script setup>
import { NButton, NIcon, NTabPane, NTabs } from "naive-ui";
import { Bookmarks, Edit, PlaylistAdd, Trash } from "@vicons/tabler";
import Bookmark from "@/components/AllFunc/Box/Bookmark.vue";
import { siteStore } from "@/stores/index.js";
import { storeToRefs } from "pinia";
import OperationModal from "@/components/AllFunc/Box/OperationModal.vue";
import { computed, nextTick, provide, ref } from "vue";
import { OperationSender } from "@/entity/enum.js";
import { DEFAULT_TAB_KEY } from "@/entity/constants.js";
import categoryIconObj from "@/assets/defaultCategoryIcon.js";

const site = siteStore();
const { bookmarkData } = storeToRefs(site);

// 操作模态框
const operationModal = ref(null);

const tabsInstRef = ref(null);

// 默认的首个索引
const firstKey = computed(() => {
  return parseInt(Object.keys(bookmarkData.value)[0]);
});

// 当前索引
const curKey = ref(firstKey.value);

// 添加类别
const addCategoryModalOpen = () => {
  operationModal.value.addOperationModalOpen();
};

// 指示条位置同步
const handleSyncPosition = (value) => {
  curKey.value = value;
  nextTick(() => tabsInstRef.value?.syncBarPosition());
};

// 编辑类别
const editCategoryModalOpen = () => {
  operationModal.value.editCategoryModalOpen(curKey.value);
};

// 类别删除确认
const confirmDel = () => {
  operationModal.value.operationDropdownSelect("delete");
};

// 提供更新指示条函数
provide("handleSyncPosition", handleSyncPosition);
</script>
