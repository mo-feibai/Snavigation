<template>
  <!--  添加书签-->
  <n-modal
    preset="card"
    v-model:show="operationModalShow"
    :title="`${operationModalType ? '编辑' : '添加'}${isCategoryOrBookmark}`"
    :bordered="false"
    @mask-click="operationModalClose"
    class="add-modal"
  >
    <n-card class="box-item"
            v-if="operationModalType && (OperationSender.BOOKMARK === props.operationSender.valueOf())">
      <n-space align="end">
        <div>是否移动书签({{ isChangeCategory ? "是" : "否" }})</div>
        <n-switch v-model:value="isChangeCategory"
                  :disabled="!bookmarkData || Object.keys(bookmarkData).length === 1" />
      </n-space>
      <n-divider title-placement="center">书签所属类别</n-divider>
      <n-select :disabled="!isChangeCategory" v-model:value="selected" :options="categoryOpts" />
    </n-card>
    <n-card class="box-item">
      <n-form
        ref="operationRef"
        :rules="operationRules"
        :model="operationValue"
        :label-width="80"
      >
        <n-form-item label="ID" path="id">
          <n-input-number
            disabled
            placeholder="请输入ID"
            v-model:value="operationValue.id"
            style="width: 100%"
            :show-button="false"
          />
        </n-form-item>
        <n-form-item :label="`${isCategoryOrBookmark}名称`" path="name">
          <n-input
            clearable
            show-count
            maxlength="14"
            v-model:value="operationValue.name"
            :placeholder="`请输入${isCategoryOrBookmark}名称`"
          />
        </n-form-item>
        <n-form-item label="站点链接" path="url" v-if="OperationSender.BOOKMARK === props.operationSender.valueOf()">
          <n-input clearable v-model:value="operationValue.url" placeholder="请输入站点链接" />
        </n-form-item>
      </n-form>
    </n-card>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="operationModalClose"> 取消</n-button>
        <n-button strong secondary @click="addOrEdit">
          {{ operationModalType ? "编辑" : "添加" }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <!-- 书签右键菜单 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="large"
    :x="operationDropdownX"
    :y="operationDropdownY"
    :options="operationDropdownOptions"
    :show="operationDropdownShow"
    :on-clickoutside="
      () => {
        operationDropdownShow = false;
      }
    "
    @select="operationDropdownSelect"
  />
</template>

<script setup>

import {
  NButton,
  NCard,
  NDivider,
  NDropdown,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
} from "naive-ui";
import { computed, h, inject, nextTick, ref, toRef } from "vue";
import identifyInput from "@/utils/identifyInput.js";
import { siteStore } from "@/stores/index.js";
import { storeToRefs } from "pinia";
import { OperationSender } from "@/entity/enum.js";
import SvgIcon from "@/components/SvgIcon.vue";
import { DEFAULT_TAB_KEY, DEFAULT_TAB_NAME } from "@/entity/constants.js";

// 注入更新指示条函数
const syncPositionHandler = inject("handleSyncPosition");

// 图标渲染
const renderIcon = (icon) => {
  return () => {
    return h(SvgIcon, { iconName: `icon-${icon}` }, null);
  };
};

const props = defineProps({
  operationSender: {
    type: Number,
    required: true,
  },
  bookmarkKey: {
    type: String,
    required: false,
  },
  delKey: {
    type: String,
    required: false,
  },
});

// 判断文字显示书签还是类别
const isCategoryOrBookmark = computed(() => {
  return OperationSender.CATEGORY === props.operationSender.valueOf() ? "类别" : "书签";
});

const site = siteStore();
const { bookmarkData } = storeToRefs(site);

const bookmarks = toRef(bookmarkData.value[props.bookmarkKey], "bookmarks");

// 添加书签数据
const operationRef = ref(null);
const operationModalShow = ref(false);
const operationModalType = ref(false); // false 添加 / true 编辑
const operationValue = ref({});
const operationRules = {
  id: {
    required: true,
    type: "number",
    message: "请输入合法 ID",
    trigger: ["input", "blur"],
  },
  name: {
    required: true,
    message: "请输入名称",
    trigger: ["input", "blur"],
  },
  url: {
    required: true,
    validator(rule, value) {
      if (!value) {
        return new Error("请输入站点链接");
      } else if (identifyInput(value) !== "url") {
        return new Error("请检查是否为正确的网址");
      }
      return true;
    },
    trigger: ["input", "blur"],
  },
};
const selected = ref(props.bookmarkKey);
const categoryOpts = computed(() => {
  return Object.values(bookmarkData.value).map((item) => {
    return {
      label: item.name,
      value: item.key.toString(),
      disabled: item.key.toString() === props.bookmarkKey,
    };
  });
});
const isChangeCategory = ref(false);

// 右键菜单数据
const operationDropdownX = ref(0);
const operationDropdownY = ref(0);
const operationDropdownShow = ref(false);
const operationDropdownOptions = [
  {
    label: "编辑",
    key: "edit",
    icon: renderIcon("edit"),
  },
  {
    label: "删除",
    key: "delete",
    icon: renderIcon("delete-1"),
  },
];

// 开启添加书签
const addOperationModalOpen = () => {
  if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
    // 生成 ID
    const categoryMaxId = Object.values(bookmarkData.value).map((item) => {
      return item.key;
    }).reduce((max, item) => {
      return item > max ? item : max;
    }, -1);
    // 生成表单数据
    operationValue.value = {
      id: categoryMaxId + 1,
      name: "",
      url: "",
    };
  } else {
    // 生成 ID
    const bookmarkMaxId = bookmarks.value.reduce((max, item) => {
      return item.id > max ? item.id : max;
    }, -1);

    // 生成表单数据
    operationValue.value = {
      id: bookmarkMaxId + 1,
      name: "",
      url: "",
    };
  }
  operationModalType.value = false;
  operationModalShow.value = true;
};

// 开启类别编辑弹窗
const editCategoryModalOpen = (curIndex) => {
  operationModalType.value = true;
  operationModalShow.value = true;

  // 写入弹窗数据
  operationValue.value = {
    id: bookmarkData.value[curIndex].key,
    name: bookmarkData.value[curIndex].name,
    url: "",
  };
};

// 添加或编辑
const addOrEdit = () => {
  operationRef.value?.validate((errors) => {
    if (errors) {
      $message.error("请检查您的输入");
      return false;
    }
    // 新增操作
    if (!operationModalType.value) {
      // 是否重复
      let isDuplicate;
      if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
        isDuplicate = Object.values(bookmarkData.value).map((item) => {
          return item.name;
        })?.some((item) => item === operationValue.value.name);
      } else {
        isDuplicate = bookmarks.value?.some(
          (item) =>
            item.name === operationValue.value.name || item.url === operationValue.value.url,
        );
      }
      if (isDuplicate) {
        $message.error(`新增与已有${isCategoryOrBookmark.value}重复`);
        return false;
      }
      if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
        bookmarkData.value[operationValue.value.id] = {
          key: operationValue.value.id,
          name: operationValue.value.name,
          bookmarks: [],
        };

        // 如果默认类别存在且无标签，则移除默认类别
        if (bookmarkData.value[DEFAULT_TAB_KEY] && bookmarkData.value[DEFAULT_TAB_KEY].bookmarks.length === 0) {
          delete bookmarkData.value[DEFAULT_TAB_KEY];
        }

        // 提交事件
        syncPositionHandler(operationValue.value.id);
      } else {
        bookmarks.value.push({
          id: operationValue.value.id,
          name: operationValue.value.name,
          url: operationValue.value.url,
        });
      }
      $message.success(`${isCategoryOrBookmark.value}添加成功`);
      operationModalClose();
      return true;
    } else {
      // 编辑操作
      let willMoveBookmarks = null;
      if (OperationSender.BOOKMARK === props.operationSender.valueOf() && selected.value !== props.bookmarkKey) {
        willMoveBookmarks = toRef(bookmarkData.value[selected.value], "bookmarks");
      } else {
        willMoveBookmarks = ref(null);
      }
      console.log(willMoveBookmarks.value);

      // 是否重复
      let isDuplicate;
      if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
        isDuplicate = Object.values(bookmarkData.value).filter((item) => item.key !== operationValue.value.id).map((item) => {
          return item.name;
        })?.some((item) => item === operationValue.value.name);
      } else {
        // 是否移动书签，如果要移动则在移动后的种类中比较重复
        if (isChangeCategory.value) {
          isDuplicate = willMoveBookmarks.value?.some((item) =>
            item.name === operationValue.value.name || item.url === operationValue.value.url,
          );
        } else {
          isDuplicate = bookmarks.value?.filter((item) => item.id !== operationValue.value.id).some(
            (item) =>
              item.name === operationValue.value.name || item.url === operationValue.value.url,
          );
        }
      }
      if (isDuplicate) {
        $message.error(`编辑后与已有${isCategoryOrBookmark.value}重复`);
        return false;
      }

      // 编辑操作
      if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
        bookmarkData.value[operationValue.value.id].name = operationValue.value.name;
      } else {
        const index = bookmarks.value.findIndex((item) => item.id === operationValue.value.id);
        if (index === -1) {
          $message.error(`${isCategoryOrBookmark.value}中不存在该项，请重试`);
          return false;
        }

        // 如果需要移动书签，则先删除原种类中的书签，再添加到移动后种类
        if (isChangeCategory.value) {
          const bookmarkMaxId = willMoveBookmarks.value.reduce((max, item) => {
            return item.id > max ? item.id : max;
          }, -1);
          bookmarks.value.splice(index, 1);
          if (DEFAULT_TAB_KEY === parseInt(props.bookmarkKey) && bookmarks.value.length === 0) {
            // 删除默认类别
            delete bookmarkData.value[DEFAULT_TAB_KEY];

            // 更新tab指示条位置
            syncPositionHandler(parseInt(Object.keys(bookmarkData.value)[0]));
          }

          willMoveBookmarks.value.push({
            id: bookmarkMaxId + 1,
            name: operationValue.value.name,
            url: operationValue.value.url,
          });
        } else {
          bookmarks.value[index].name = operationValue.value.name;
          bookmarks.value[index].url = operationValue.value.url;
        }
      }
      $message.success(`${isCategoryOrBookmark.value}编辑成功`);
      operationModalClose();
      return true;
    }
  });
};

// 删除操作
const operationDel = () => {
  if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
    // 判断该类别下是否包含书签
    const willRemoveBookmarks = bookmarkData.value[props.delKey].bookmarks;
    if (willRemoveBookmarks && willRemoveBookmarks.length > 0) {
      // 如果默认类别不存在，添加默认类别
      if (!bookmarkData.value[DEFAULT_TAB_KEY]) {
        bookmarkData.value[DEFAULT_TAB_KEY.toString()] = {
          key: DEFAULT_TAB_KEY,
          name: DEFAULT_TAB_NAME,
          bookmarks: willRemoveBookmarks,
        };
      } else {
        // 存在则先将书签追加到默认类别下
        bookmarkData.value[DEFAULT_TAB_KEY].bookmarks.push(...bookmarks.value);
      }
    }

    // 判断是否添加默认类别
    if (Object.keys(bookmarkData.value).length === 1) {
      bookmarkData.value[DEFAULT_TAB_KEY.toString()] = {
        key: DEFAULT_TAB_KEY,
        name: DEFAULT_TAB_NAME,
        bookmarks: [],
      };
    }
    const keyArr = Object.keys(bookmarkData.value);
    let curKeyIndex = keyArr.findIndex((item) => item === props.delKey);
    let nextKey;
    if (curKeyIndex === keyArr.length - 1) {
      nextKey = keyArr[curKeyIndex - 1];
    } else {
      nextKey = keyArr[curKeyIndex + 1];
    }
    delete bookmarkData.value[props.delKey];

    // 删除后重置指示条
    syncPositionHandler(parseInt(nextKey));
    $message.success("类别删除成功");
  } else {
    const deleteId = operationValue.value.id;
    if (typeof deleteId === "number") {
      const indexToRemove = bookmarks.value.findIndex((item) => item.id === deleteId);
      if (indexToRemove !== -1) {
        bookmarks.value.splice(indexToRemove, 1);
        if (bookmarks.value.length === 0) {
          // 删除默认类别
          if (DEFAULT_TAB_KEY === parseInt(props.bookmarkKey) && Object.keys(bookmarkData.value).length > 1) {
            delete bookmarkData.value[DEFAULT_TAB_KEY];

            // 更新tab指示条位置
            syncPositionHandler(parseInt(Object.keys(bookmarkData.value)[0]));
          }
        } else {
          // 将后续元素的 id 前移一位
          for (let i = indexToRemove; i < bookmarks.value.length; i++) {
            bookmarks.value[i].id = i;
          }
        }
        $message.success("书签删除成功");
        return true;
      }
      $message.error("书签删除失败，请重试");
    } else {
      $message.error("书签删除失败，请重试");
    }
  }
};

// 关闭弹窗
const operationModalClose = () => {
  operationModalShow.value = false;
  operationValue.value = {
    id: null,
    name: "",
    url: "",
  };
  isChangeCategory.value = false;
  selected.value = props.bookmarkKey;
};

// 开启右键菜单
const operationContextmenu = (e, data) => {
  e.preventDefault();
  operationDropdownShow.value = false;
  // 写入弹窗数据
  const { id, name, url } = data;
  operationValue.value = { id, name, url };
  nextTick().then(() => {
    operationDropdownShow.value = true;
    operationDropdownX.value = e.clientX;
    operationDropdownY.value = e.clientY;
  });
};

// 右键菜单点击
const operationDropdownSelect = (key) => {
  operationDropdownShow.value = false;
  switch (key) {
    case "edit":
      operationModalType.value = true;
      operationModalShow.value = true;
      break;
    case "delete":
      $dialog.warning({
        title: `删除${isCategoryOrBookmark.value}`,
        content: `确认删除 ${OperationSender.CATEGORY === props.operationSender.valueOf() ? bookmarkData.value[props.delKey].name : operationValue.value.name} ${isCategoryOrBookmark.value}？此操作将无法恢复！`,
        positiveText: "删除",
        negativeText: "取消",
        onPositiveClick: () => {
          operationDel();
        },
      });
      break;
    default:
      break;
  }
};

// 暴露组件的方法
defineExpose({
  addOperationModalOpen, operationContextmenu, editCategoryModalOpen, operationDropdownSelect,
});
</script>

<style scoped lang="scss">
.add-modal {

  .box-item {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 12px;
    border: none;
    box-shadow: var(--main-box-shadow);
    --n-color-modal: var(--main-background-light-color);

    .n-card__content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
