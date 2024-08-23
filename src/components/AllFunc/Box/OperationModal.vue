<template>
  <!--  添加书签-->
  <n-modal
    preset="card"
    v-model:show="operationModalShow"
    :title="`${operationModalType ? '编辑' : '添加'}${isCategoryOrBookmark}`"
    :bordered="false"
    @mask-click="operationModalClose"
    @after-leave="initModalData"
    class="add-modal"
  >
    <n-card
      class="box-item"
      v-if="operationModalType && OperationSender.BOOKMARK === props.operationSender.valueOf()"
    >
      <n-space align="end">
        <div>是否移动书签({{ isChangeCategory ? "是" : "否" }})</div>
        <n-switch
          v-model:value="isChangeCategory"
          :disabled="!bookmarkData || Object.keys(bookmarkData).length === 1"
        />
      </n-space>
      <n-divider title-placement="center">书签所属类别</n-divider>
      <n-select :disabled="!isChangeCategory" v-model:value="selected" :options="categoryOpts" />
    </n-card>
    <n-card class="box-item">
      <n-form ref="operationRef" :rules="operationRules" :model="operationValue" :label-width="80">
        <n-form-item label="ID" path="id">
          <n-input-number
            disabled
            placeholder="请输入ID"
            v-model:value="operationValue.id"
            style="width: 100%"
            :show-button="false"
          />
        </n-form-item>
        <n-form-item label="图标类型">
          <n-select
            v-model:value="operationValue.iconType"
            :options="getIconTypeOpts()"
            :disabled="OperationSender.CATEGORY === props.operationSender.valueOf()"
          />
        </n-form-item>
        <n-form-item :label="`${isCategoryOrBookmark}图标`" path="iconName">
          <div class="multi-form-item">
            <n-input v-model:value="operationValue.iconName" :placeholder="placeholder" />

            <div
              class="bookmark-icon"
              v-if="OperationSender.BOOKMARK === props.operationSender.valueOf()"
            >
              <n-avatar
                v-if="operationValue.iconType === IconType.URL"
                class="avatar-icon"
                size="medium"
                fallback-src="favicon.png"
                :src="
                  !operationValue.iconName || operationValue.iconName.length === 0
                    ? 'favicon.png'
                    : operationValue.iconName
                "
              />
              <n-avatar v-else class="avatar-icon" size="medium">
                {{ operationValue.iconName }}
              </n-avatar>
            </div>
            <div class="bookmark-icon" v-else>
              <n-avatar
                v-if="operationValue.iconType === IconType.THIRD_PARTY"
                class="avatar-icon"
                size="medium"
                @click="iconSelectModalOpen = true"
              >
                <n-icon :component="categoryIconObj[operationValue.iconName]?.component ?? Click" />
              </n-avatar>
            </div>
          </div>
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
        <n-form-item
          label="站点链接"
          path="url"
          v-if="OperationSender.BOOKMARK === props.operationSender.valueOf()"
        >
          <n-input
            clearable
            v-model:value="operationValue.url"
            placeholder="请输入站点链接"
            @blur="getIcon"
          />
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
  <!--  图标选择-->
  <n-modal
    preset="card"
    v-model:show="iconSelectModalOpen"
    title="选择图标"
    :bordered="false"
    class="icon-select-modal"
  >
    <n-scrollbar id="icon-scroll-container" class="icon-scrollbar">
      <n-grid x-gap="20" y-gap="10" cols="4">
        <n-grid-item v-for="(icon, iconName) in categoryIconObj" :key="iconName">
          <n-card class="icon-card" @click="selectIcon(iconName)">
            <n-icon :component="icon.component" size="40" />
            <p style="font-size: x-small">{{ icon.chineseName }}</p>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-scrollbar>
  </n-modal>
</template>

<script setup>
import {
  NAvatar,
  NButton,
  NCard,
  NDivider,
  NDropdown,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  NSwitch,
} from "naive-ui";
import { Click } from "@vicons/tabler";
import { computed, h, inject, nextTick, onMounted, ref, toRef, watchPostEffect } from "vue";
import identifyInput from "@/utils/identifyInput.js";
import { siteStore } from "@/stores/index.js";
import { storeToRefs } from "pinia";
import { IconType, OperationSender } from "@/entity/enum.js";
import SvgIcon from "@/components/SvgIcon.vue";
import { DEFAULT_ICON_SIZE, DEFAULT_TAB_KEY, DEFAULT_TAB_NAME } from "@/entity/constants.js";
import { getGoogleFavicon } from "@/api/index.js";
import categoryIconObj from "@/assets/defaultCategoryIcon.js";

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

// 当前操作的数据，用于修改后的数据恢复
let operationData = null;

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
  iconName: {
    required: true,
    message: "请选择合适的图标",
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
    const categoryMaxId = Object.values(bookmarkData.value)
      .map((item) => {
        return item.key;
      })
      .reduce((max, item) => {
        return item > max ? item : max;
      }, -1);
    // 生成表单数据
    operationValue.value.id = categoryMaxId + 1;
    operationValue.value.name = "";
    operationValue.value.url = "";
  } else {
    // 生成 ID
    const bookmarkMaxId = bookmarks.value.reduce((max, item) => {
      return item.id > max ? item.id : max;
    }, -1);

    // 生成表单数据
    operationValue.value.id = bookmarkMaxId + 1;
    operationValue.value.name = "";
    operationValue.value.url = "";
  }
  operationModalType.value = false;
  operationModalShow.value = true;
};

// 开启类别编辑弹窗
const editCategoryModalOpen = (curIndex) => {
  operationModalType.value = true;
  operationModalShow.value = true;

  // 写入弹窗数据
  operationData = {
    id: bookmarkData.value[curIndex].key,
    name: bookmarkData.value[curIndex].name,
    url: "",
    iconType: bookmarkData.value[curIndex].iconType,
    iconName: bookmarkData.value[curIndex].iconName,
  };
  // 对象复制，防止引用
  Object.assign(operationValue.value, operationData);
};

// 添加或编辑
const addOrEdit = () => {
  operationRef.value?.validate((errors) => {
    if (errors) {
      $message.error("请检查您的输入");
      return false;
    }
    if (OperationSender.CATEGORY === props.operationSender.valueOf()) {
      return categoryAddOrEdit();
    } else {
      return bookmarkAddOrEdit();
    }
  });
};

// 种类添加或编辑
const categoryAddOrEdit = () => {
  // 新增操作
  if (!operationModalType.value) {
    // 校验是否名称重复
    const isDuplicate = Object.values(bookmarkData.value)
      .map((item) => {
        return item.name;
      })
      ?.some((item) => item === operationValue.value.name);
    if (isDuplicate) {
      $message.error("新增与已有类别重复");
      return false;
    }

    // 新增类别
    bookmarkData.value[operationValue.value.id] = {
      key: operationValue.value.id,
      name: operationValue.value.name,
      iconName: operationValue.value.iconName,
      iconType: operationValue.value.iconType,
      bookmarks: [],
    };

    // 如果默认类别存在且无标签，则移除默认类别
    if (
      bookmarkData.value[DEFAULT_TAB_KEY] &&
      bookmarkData.value[DEFAULT_TAB_KEY].bookmarks.length === 0
    ) {
      delete bookmarkData.value[DEFAULT_TAB_KEY];
    }

    // 提交同步指示条事件
    syncPositionHandler(operationValue.value.id);

    // 操作成功并关闭弹窗
    $message.success("类别添加成功");
    operationModalClose();
    return true;
  } else {
    // 编辑操作
    // 校验重复的名称
    const isDuplicate = Object.values(bookmarkData.value)
      .filter((item) => item.key !== operationValue.value.id)
      .map((item) => {
        return item.name;
      })
      ?.some((item) => item === operationValue.value.name);
    if (isDuplicate) {
      $message.error("编辑后与已有类别重复");
      return false;
    }

    // 编辑操作
    bookmarkData.value[operationValue.value.id].name = operationValue.value.name;
    bookmarkData.value[operationValue.value.id].iconName = operationValue.value.iconName;
    bookmarkData.value[operationValue.value.id].iconType = operationValue.value.iconType;

    // 编辑成功后关闭弹窗
    $message.success("类别编辑成功");
    operationModalClose();
    return true;
  }
};

// 书签添加或编辑
const bookmarkAddOrEdit = () => {
  // 新增操作
  if (!operationModalType.value) {
    // 校验是否名称重复
    const isDuplicate = bookmarks.value?.some(
      (item) => item.name === operationValue.value.name || item.url === operationValue.value.url,
    );
    if (isDuplicate) {
      $message.error("新增与已有书签重复");
      return false;
    }

    // 新增书签
    bookmarks.value.push({
      id: operationValue.value.id,
      name: operationValue.value.name,
      url: operationValue.value.url,
      iconName: operationValue.value.iconName,
      iconType: operationValue.value.iconType,
    });

    // 操作成功并关闭弹窗
    $message.success(`${isCategoryOrBookmark.value}添加成功`);
    operationModalClose();
    return true;
  } else {
    // 编辑操作
    // 是否移动书签到别的类别
    let willMoveBookmarks;
    if (
      OperationSender.BOOKMARK === props.operationSender.valueOf() &&
      selected.value !== props.bookmarkKey
    ) {
      willMoveBookmarks = toRef(bookmarkData.value[selected.value], "bookmarks");
    } else {
      willMoveBookmarks = ref(null);
    }

    // 校验重复
    let isDuplicate;

    // 是否移动书签，如果要移动则在移动后的种类中比较重复
    if (isChangeCategory.value) {
      isDuplicate = willMoveBookmarks.value?.some(
        (item) => item.name === operationValue.value.name || item.url === operationValue.value.url,
      );
    } else {
      isDuplicate = bookmarks.value
        ?.filter((item) => item.id !== operationValue.value.id)
        .some(
          (item) =>
            item.name === operationValue.value.name || item.url === operationValue.value.url,
        );
    }
    if (isDuplicate) {
      $message.error("编辑后与类别下已有书签重复");
      return false;
    }

    // 编辑操作
    // 是否无效索引
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

      // 如果移动前为默认类别，则判断是否删除默认类别
      if (DEFAULT_TAB_KEY === parseInt(props.bookmarkKey) && bookmarks.value.length === 0) {
        delete bookmarkData.value[DEFAULT_TAB_KEY];

        // 更新tab指示条位置
        syncPositionHandler(parseInt(Object.keys(bookmarkData.value)[0]));
      }

      willMoveBookmarks.value.push({
        id: bookmarkMaxId + 1,
        name: operationValue.value.name,
        url: operationValue.value.url,
        iconType: operationValue.value.iconType,
        iconName: operationValue.value.iconName,
      });
    } else {
      bookmarks.value[index].name = operationValue.value.name;
      bookmarks.value[index].url = operationValue.value.url;
      bookmarks.value[index].iconName = operationValue.value.iconName;
      bookmarks.value[index].iconType = operationValue.value.iconType;
    }

    // 编辑成功后关闭弹窗
    $message.success("书签编辑成功");
    operationModalClose();
    return true;
  }
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
          if (
            DEFAULT_TAB_KEY === parseInt(props.bookmarkKey) &&
            Object.keys(bookmarkData.value).length > 1
          ) {
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

// 初始化弹窗值
const initModalData = () => {
  operationValue.value.iconType =
    OperationSender.CATEGORY === props.operationSender.valueOf()
      ? IconType.THIRD_PARTY
      : IconType.URL;
  operationValue.value.iconName = "";
  operationValue.value.id = null;
  operationValue.value.name = "";
  operationValue.value.url = "";
};

// 关闭弹窗
const operationModalClose = () => {
  operationModalShow.value = false;
  isChangeCategory.value = false;
  selected.value = props.bookmarkKey;
};

//获取站点图标
const getIcon = async () => {
  if (!operationValue.value || operationValue.value.url.trim() === "") {
    return;
  }

  const urlSplits = operationValue.value.url.split("/");
  let domain;
  if (urlSplits[2]) {
    domain = urlSplits[2];
  } else {
    domain = ""; //如果url不正确就取空
  }
  const resp = await getGoogleFavicon(domain, DEFAULT_ICON_SIZE);
  if (resp && resp.data) {
    const contentLocation = resp.headers["content-location"];
    if (contentLocation) {
      operationValue.value.iconName = contentLocation;
      operationValue.value.iconType = IconType.URL;
    } else {
      $message.error("获取图标失败");
      operationValue.value.iconName = "";
      placeholder.value = "获取图标失败,自行填写图标链接或者切换为文本图标";
    }
  } else {
    $message.error("获取图标失败");
    operationValue.value.iconName = "";
    placeholder.value = "获取图标失败,自行填写图标链接或者切换为文本图标";
  }
};

// 文字图标
const getTextIcon = () => {
  if (operationValue.value.name.length === 0) {
    return "无图";
  }
  if (operationValue.value.name.length <= 2) {
    return operationValue.value.name;
  }
  let points = 0;
  let index = 0;
  for (const chr of operationValue.value.name) {
    if (/^[a-zA-Z0-9]$/.test(chr)) {
      points += 1;
    } else {
      points += 2;
    }
    if (points >= 4) {
      break;
    }
    index++;
  }
  return operationValue.value.name.substring(0, index + 1);
};

// 开启右键菜单
const operationContextmenu = (e, operationBookmarkIndex) => {
  e.preventDefault();
  operationDropdownShow.value = false;
  // 写入弹窗数据
  operationData = bookmarks.value[operationBookmarkIndex];
  const { id, name, url, iconType, iconName } = operationData;
  operationValue.value = { id, name, url, iconName, iconType };
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

// 图标种类选项
const getIconTypeOpts = () => {
  const result = [];
  for (let iconTypeKey in IconType) {
    let value = IconType[iconTypeKey];
    result.push({
      label: iconTypeKey.toLowerCase(),
      value: value,
      disabled:
        OperationSender.BOOKMARK === props.operationSender.valueOf()
          ? value === IconType.THIRD_PARTY
          : value === IconType.URL,
    });
  }
  return result;
};

// 图标输入框提示
const placeholder = ref("");

// 监听图标种类
watchPostEffect(() => {
  switch (operationValue.value.iconType) {
    case IconType.TEXT:
      operationValue.value.iconName = getTextIcon();
      break;
    case IconType.URL:
      if (operationModalShow.value) {
        // 如果为新增模式或者当前数据和初始数据相同，则清空重新获取
        if (!operationModalType.value) {
          operationValue.value.iconName = "";
          placeholder.value = "书签图标,填写站点链接自动获取";
        } else if (IconType.TEXT === operationData.iconType) {
          getIcon();
        } else {
          operationValue.value.iconName = operationData.iconName;
        }
      }
      break;
    case IconType.THIRD_PARTY:
      if (operationModalShow.value) {
        // 如果为新增模式或者当前数据和初始数据相同，则清空重新获取
        if (!operationModalType.value || IconType.TEXT === operationData.iconType) {
          operationValue.value.iconName = "";
          placeholder.value = "类别图标,点击右边选择图标";
        } else {
          operationValue.value.iconName = operationData.iconName;
        }
      }
      break;
  }
});

// 图标选择弹窗
const iconSelectModalOpen = ref(false);

const selectIcon = (iconName) => {
  operationValue.value.iconName = iconName;
  operationValue.value.iconType = IconType.THIRD_PARTY;
  iconSelectModalOpen.value = false;
};

onMounted(() => {
  // 初始化弹框值
  initModalData();
});

// 暴露组件的方法
defineExpose({
  addOperationModalOpen,
  operationContextmenu,
  editCategoryModalOpen,
  operationDropdownSelect,
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

    .multi-form-item {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      gap: max(calc(2%), 10px);

      .bookmark-icon {
        display: flex;
        align-items: center;

        .avatar-icon {
          background-color: var(--main-background-light-color);
        }
      }
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>

<style lang="scss">
.icon-select-modal {
  height: 100%;
  overflow: hidden;

  .icon-scrollbar {
    margin-top: 1rem;
    max-height: calc(30vh);
    transition: max-height 0.3s;

    .icon-card {
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

      &:hover {
        background-color: var(--main-background-hover-color);
        box-shadow: 0 0 0 2px var(--main-background-hover-color);
      }
    }
  }
}
</style>
