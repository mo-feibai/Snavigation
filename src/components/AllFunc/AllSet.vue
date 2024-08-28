<template>
  <div class="all-set">
    <n-tabs class="set" size="large" justify-content="space-evenly" animated>
      <n-tab-pane name="main" tab="基础设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 主题与壁纸</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">主题类别</span>
              <span class="tip">切换全站主题类别</span>
            </div>
            <n-select class="set" v-model:value="themeType" :options="themeTypeOptions" />
          </n-card>
          <n-card
            class="set-item cover"
            :content-style="{
              flexDirection: 'column',
              alignItems: 'flex-start',
            }"
          >
            <div class="desc">
              <div class="name">
                <span class="title">壁纸偏好</span>
                <span class="tip"> 除默认以外的其他选项可能会导致页面载入缓慢 </span>
              </div>
              <n-space>
                <Transition name="fade" mode="out-in">
                  <n-button
                    v-if="backgroundType !== 0"
                    strong
                    secondary
                    @click="changeBackground(BackgroundType.LOCAL, true)"
                  >
                    恢复默认
                  </n-button>
                </Transition>
                <n-button strong secondary @click="customCoverModal = true">
                  <template v-if="backgroundType === BackgroundType.CUSTOMIZE" #icon>
                    <SvgIcon iconName="icon-confirm" />
                  </template>
                  {{ backgroundType === BackgroundType.CUSTOMIZE ? "已开启自定义" : "自定义" }}
                </n-button>
              </n-space>
            </div>
            <n-divider />
            <n-grid
              class="cover-selete"
              responsive="screen"
              cols="3 s:4 m:5 l:6"
              :x-gap="16"
              :y-gap="16"
            >
              <n-grid-item
                v-for="item in backgroundTypeArr"
                :key="item.id"
                :class="item.id === backgroundType ? 'item check' : 'item'"
                @click="changeBackground(item.id)"
              >
                <div :title="item.tip"><span class="name" v-html="item.name" /></div>
              </n-grid-item>
            </n-grid>
          </n-card>
          <n-h6 prefix="bar"> 搜索</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索引擎</span>
              <span class="tip">切换或自定义搜索引擎</span>
            </div>
            <n-button
              strong
              secondary
              @click="
                () => {
                  status.setSiteStatus('focus');
                  status.setEngineChangeStatus(true);
                }
              "
            >
              前往调整
            </n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">搜索建议</span>
              <span class="tip">是否显示搜索建议</span>
            </div>
            <n-switch v-model:value="showSuggestions" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">跳转方式</span>
              <span class="tip">全站链接跳转方式</span>
            </div>
            <n-select class="set" v-model:value="urlJumpType" :options="urlJumpTypeOptions" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="personalization" tab="个性设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 壁纸</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸遮罩</span>
              <span class="tip">壁纸周围是否显示暗色遮罩</span>
            </div>
            <n-switch v-model:value="showBackgroundGray" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">壁纸模糊</span>
              <span class="tip">调整壁纸高斯模糊的程度</span>
            </div>
            <n-slider
              class="set"
              v-model:value="backgroundBlur"
              :step="0.01"
              :min="0"
              :max="10"
              :tooltip="false"
            />
          </n-card>
          <n-h6 prefix="bar"> 天气与时间</n-h6>
          <n-card class="set-item">
            <div class="set-multi">
              <div class="name">
                <span class="title">天气api key</span>
                <span class="tip"
                  >用于请求天气和位置数据(<a
                    href="https://dev.qweather.com/docs/api/"
                    target="_blank"
                    >和风天气</a
                  >)</span
                >
              </div>
              <n-space align="center">
                <transition mode="out-in">
                  <n-icon v-if="isValidApiKey === null" size="24" color="orange">
                    <AlertCircle />
                  </n-icon>
                  <n-icon v-else-if="!isValidApiKey" size="24" color="red">
                    <CircleX />
                  </n-icon>
                  <n-icon v-else size="24" color="green">
                    <CircleCheck />
                  </n-icon>
                </transition>
                <n-input v-model:value="weatherApiKey" :disabled="!inputMode" />
                <Transition mode="out-in">
                  <n-button strong secondary v-if="!inputMode" @click="inputMode = true"
                    >编辑
                  </n-button>
                  <n-button strong secondary v-else @click="validApiKey">校验</n-button>
                </Transition>
              </n-space>
            </div>
          </n-card>
          <n-card class="set-item">
            <div class="set-multi">
              <div class="name">
                <span class="title">当前位置</span>
                <span class="tip">展示和更新当前位置信息</span>
              </div>
              <n-space align="center">
                <n-input v-model:value="cityFullName" disabled />
                <n-icon @click="chooseACityCode">
                  <Edit />
                </n-icon>
              </n-space>
            </div>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">天气显示</span>
              <span class="tip">是否在首页时间下展示天气</span>
            </div>
            <n-switch v-model:value="showWeather" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟样式</span>
              <span class="tip">选择一种时钟样式</span>
            </div>
            <n-select class="set" v-model:value="timeStyle" :options="timeStyleOptions" />
          </n-card>
          <n-card v-if="timeStyle === 'one'" class="set-item">
            <div class="name">
              <span class="title">时间显秒</span>
              <span class="tip">分钟后面显示秒数(仅横向排布)</span>
            </div>
            <n-switch v-model:value="showSeconds" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">时钟显零</span>
              <span class="tip">是否在时钟小于 10 时补 0</span>
            </div>
            <n-switch v-model:value="showZeroTime" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">显示农历</span>
            </div>
            <n-switch v-model:value="showLunar" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">12 小时制</span>
            </div>
            <n-switch v-model:value="use12HourFormat" :round="false" />
          </n-card>
          <n-h6 prefix="bar"> 搜索框</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动收缩</span>
              <span class="tip">是否在非搜索状态时收起搜索框</span>
            </div>
            <n-switch v-model:value="smallInput" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动聚焦</span>
              <span class="tip">打开网站时自动聚焦搜索框</span>
            </div>
            <n-switch v-model:value="autoFocus" :round="false" />
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">自动失焦</span>
              <span class="tip">跳转搜索后搜索框自动失焦</span>
            </div>
            <n-switch v-model:value="autoInputBlur" :round="false" />
          </n-card>
          <n-h6 prefix="bar"> 书签</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">书签排序方式</span>
              <span class="tip">选择一种书签排序方式</span>
            </div>
            <n-select class="set" v-model:value="bookmarkSort" :options="bookmarkSortOpts" />
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
      <n-tab-pane name="other" tab="其他设置">
        <n-scrollbar class="scrollbar">
          <n-h6 prefix="bar"> 重置</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">站点重置</span>
              <span class="tip">若站点显示异常或出现问题时可尝试此操作</span>
            </div>
            <n-button strong secondary @click="resetSite"> 重置</n-button>
          </n-card>
          <n-h6 prefix="bar"> 备份</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">配置备份</span>
              <span class="tip">将站点配置及个性化内容进行备份</span>
            </div>
            <n-button strong secondary @click="doBackup(false)"> 备份</n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">书签备份</span>
              <span class="tip">将站点收藏的书签内容进行备份</span>
            </div>
            <n-button strong secondary @click="doBackup(true)"> 备份</n-button>
          </n-card>
          <n-h6 prefix="bar"> 恢复</n-h6>
          <n-card class="set-item">
            <div class="name">
              <span class="title">配置恢复</span>
              <span class="tip">导入备份的配置文件用于恢复自定义配置</span>
            </div>
            <input
              ref="recoverRef"
              type="file"
              style="display: none"
              accept=".json"
              @change="recoverSite"
            />
            <n-button strong secondary @click="recoverRef?.click()"> 恢复</n-button>
          </n-card>
          <n-card class="set-item">
            <div class="name">
              <span class="title">书签恢复</span>
              <span class="tip">导入备份的书签文件用于恢复存储的书签</span>
            </div>
            <input
              ref="recoverBookmarkRef"
              type="file"
              style="display: none"
              accept=".json"
              @change="recoverBookmarks"
            />
            <n-button strong secondary @click="recoverBookmarkRef?.click()"> 恢复</n-button>
          </n-card>
        </n-scrollbar>
      </n-tab-pane>
    </n-tabs>
    <!-- 自定义壁纸 -->
    <n-modal preset="card" title="自定义壁纸" v-model:show="customCoverModal" :bordered="false">
      <n-form>
        <n-form-item label="自定义壁纸链接">
          <n-input
            clearable
            type="text"
            v-model:value="customCoverUrl"
            placeholder="请输入自定义壁纸链接"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button strong secondary @click="customCoverModal = false"> 取消</n-button>
          <n-button strong secondary @click="setCustomCover"> 确认</n-button>
        </n-space>
      </template>
    </n-modal>
    <n-modal
      preset="card"
      title="选择城市编码"
      v-model:show="chooseCityCode"
      :bordered="false"
      class="location-modal"
    >
      <n-space justify="center">
        <n-input v-model:value="inputKeyword" />
        <n-button strong secondary @click="doLocationSearch"> 搜索</n-button>
      </n-space>
      <n-scrollbar class="set-scrollbar">
        <n-grid x-gap="20" y-gap="10" cols="2">
          <n-grid-item v-for="(loc, index) of locationInfos" :key="index">
            <n-card
              class="loc-info"
              :class="{ selected: curIndex === index }"
              :title="loc.name"
              hoverable
              @click="curIndex = index"
            >
              <template #header-extra>
                {{ loc.id }}
              </template>
              <template #footer> {{ loc.country }}•{{ loc.adm1 }}•{{ loc.adm2 }}</template>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-scrollbar>
      <template #footer>
        <n-space justify="end">
          <n-button strong secondary @click="chooseCityCode = false"> 取消</n-button>
          <n-button strong secondary @click="setCityCode"> 确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NH6,
  NIcon,
  NInput,
  NModal,
  NScrollbar,
  NSelect,
  NSlider,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NDivider,
} from "naive-ui";
import { AlertCircle, CircleCheck, CircleX, Edit } from "@vicons/tabler";
import { storeToRefs } from "pinia";
import { setStore, siteStore, statusStore } from "@/stores";
import identifyInput from "@/utils/identifyInput";
import { getLocationInfo, testApiKey } from "@/api/index.js";
import { BackgroundType, BookmarkSort } from "@/entity/enum.js";
import backgroundTypeArr from "@/assets/defaultBackgroundType.js";

const set = setStore();
const site = siteStore();
const status = statusStore();
const {
  themeType,
  backgroundType,
  backgroundCustom,
  showBackgroundGray,
  backgroundBlur,
  smallInput,
  autoFocus,
  autoInputBlur,
  showLunar,
  showWeather,
  showSeconds,
  showZeroTime,
  use12HourFormat,
  showSuggestions,
  urlJumpType,
  timeStyle,
  cityCode,
  cityFullName,
  cityName,
  weatherApiKey,
  isValidApiKey,
  bookmarkSort,
} = storeToRefs(set);

const recoverRef = ref(null);
const recoverBookmarkRef = ref(null);
const customCoverModal = ref(false);
const customCoverUrl = ref("");
const inputMode = ref(false);

// 校验apiKey
const validApiKey = async () => {
  const resp = await testApiKey(weatherApiKey.value);
  isValidApiKey.value = resp.data.code === "200";
  inputMode.value = false;
};

// 是否正在搜索
const chooseCityCode = ref(false);

// 选择一个城市编码
const chooseACityCode = () => {
  if (!isValidApiKey.value) {
    $message.warning("请填入一个正确的key");
  } else {
    chooseCityCode.value = true;
  }
};

// 搜索关键词
const inputKeyword = ref("");

// 位置信息列表
const locationInfos = ref([]);

// 搜索位置信息
const doLocationSearch = async () => {
  if (inputKeyword.value.trim() === "") {
    $message.warning("请输入有效区域");
    return;
  }
  const resp = await getLocationInfo(weatherApiKey.value, inputKeyword.value);
  if (resp.data.code !== "200") {
    $message.error("地区查询失败");
    return;
  }
  locationInfos.value = resp.data.location;
};

// 当前列表索引
const curIndex = ref(-1);

// 设置城市代码
const setCityCode = () => {
  const curCity = locationInfos.value[curIndex.value];
  if (curCity) {
    const { id, country, adm1, adm2, name } = curCity;
    cityCode.value = id;
    cityFullName.value = `${country}•${adm1}•${adm2}•${name}`;
    cityName.value = adm2;
    $message.success(`已设置城市${curCity.name}，刷新后生效`);
  }
  chooseCityCode.value = false;
};

// 主题类别
const themeTypeOptions = [
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
];

// 切换壁纸
const changeBackground = (type, reset = false) => {
  if (reset) {
    $dialog.warning({
      title: "壁纸恢复",
      content: "确认恢复默认壁纸？若当前为自定义壁纸，你的自定义壁纸将丢失！",
      positiveText: "恢复",
      negativeText: "取消",
      onPositiveClick: () => {
        backgroundType.value = 0;
        $message.info("已恢复为默认壁纸，刷新后生效");
      },
    });
    return true;
  }
  backgroundType.value = type;
  $message.success(
    `已切换${backgroundTypeArr.filter((item) => item.id === type)[0].name}，刷新后生效`,
  );
};

// 链接跳转方式
const urlJumpTypeOptions = [
  {
    label: "新页面打开",
    value: "open",
  },
  {
    label: "当前页打开",
    value: "href",
  },
];

// 时钟样式
const timeStyleOptions = [
  {
    label: "横向排布",
    value: "one",
  },
  {
    label: "竖向排布",
    value: "two",
  },
];

// 书签排序选项
const bookmarkSortOpts = [
  {
    label: "添加时间",
    value: BookmarkSort.ADD_TIME,
  },
  {
    label: "访问次数",
    value: BookmarkSort.VISITS,
  },
  {
    label: "字母顺序",
    value: BookmarkSort.ALPHABETICAL_ORDER,
  },
];

// 自定义壁纸
const setCustomCover = () => {
  if (identifyInput(customCoverUrl.value) === "url") {
    backgroundType.value = BackgroundType.CUSTOMIZE;
    backgroundCustom.value = customCoverUrl.value;
    customCoverModal.value = false;
    $message.error("已切换为自定义壁纸，刷新后生效");
  } else {
    $message.error("请输入正确的网址");
  }
};

// 站点重置
const resetSite = () => {
  $dialog.warning({
    title: "站点重置",
    content: "确认重置站点为默认状态？你的全部书签数据以及自定义设置都将丢失！务必提前备份重要数据",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      localStorage.clear();
      $message.info("站点重置成功，即将刷新");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
  });
};

// 操作备份
const doBackup = (isBookmark) => {
  const statusStr = isBookmark ? "书签" : "站点";
  try {
    const fileName = `Snavigation_Backup_${isBookmark ? "Bookmark" : "Site"}_${new Date().getTime()}.json`;
    const jsonData = JSON.stringify(isBookmark ? site.$state.bookmarkData : set.$state);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 备份完成
    $message.success(`${statusStr}备份成功`);
  } catch (error) {
    console.error(`${statusStr}备份失败：`, error);
    $message.error(`${statusStr}备份失败`);
  }
};

// 站点恢复
const recoverSite = async () => {
  try {
    const fileInput = recoverRef.value;
    if (!fileInput?.files.length) {
      $message.error("请选择要恢复的备份文件");
      return false;
    }
    const file = fileInput.files[0];
    const jsonData = await file.text();
    const data = JSON.parse(jsonData);
    // 恢复数据
    $dialog.warning({
      title: "站点恢复",
      content: "确认使用该恢复文件？你现有的数据以及自定义设置都将被覆盖！",
      positiveText: "恢复",
      negativeText: "取消",
      onPositiveClick: async () => {
        const isSuccess = await set.recoverSiteData(data);
        if (isSuccess) {
          $message.info("站点恢复成功，即将刷新");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          $message.error("站点数据恢复失败，请重试");
        }
      },
      onNegativeClick: () => {
        recoverRef.value.value = null;
      },
    });
  } catch (error) {
    console.error("站点数据恢复失败：", error);
    $message.error("站点数据恢复失败，请重试");
  }
};

// 书签数据恢复
const recoverBookmarks = async () => {
  try {
    const fileInput = recoverBookmarkRef.value;
    if (!fileInput?.files.length) {
      $message.error("请选择要恢复的备份书签");
      return false;
    }
    const file = fileInput.files[0];
    const jsonData = await file.text();
    const data = JSON.parse(jsonData);
    // 恢复数据
    $dialog.warning({
      title: "书签恢复",
      content: "确认使用该恢复书签？你现有书签数据将被覆盖！",
      positiveText: "恢复",
      negativeText: "取消",
      onPositiveClick: async () => {
        const isSuccess = site.recoverBookmarkData(data);
        if (isSuccess) {
          $message.info("书签数据恢复成功，即将刷新");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          $message.error("书签数据恢复失败，请重试");
        }
      },
      onNegativeClick: () => {
        recoverBookmarkRef.value.value = null;
      },
    });
  } catch (error) {
    console.error("书签数据恢复失败：", error);
    $message.error("书签数据恢复失败，请重试");
  }
};

onMounted(() => {
  // 检测是否存在自定义壁纸
  if (backgroundCustom.value) customCoverUrl.value = backgroundCustom.value;
});
</script>

<style lang="scss">
.cover-selete {
  margin-top: 12px;

  .item {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: var(--main-background-light-color);
    transition:
      background-color 0.3s,
      box-shadow 0.3s;

    &.check {
      background-color: var(--main-background-hover-color);

      &::before {
        content: "";
        position: absolute;
        border-radius: 12px;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 2px solid var(--main-background-hover-color);
        transition: opacity 0.3s;
      }
    }

    &:hover {
      background-color: var(--main-background-hover-color);
      box-shadow: 0 0 0 2px var(--main-background-hover-color);

      &::before {
        opacity: 0;
      }
    }

    &:active {
      box-shadow: none;
    }
  }
}

.location-modal {
  height: 100%;
  overflow: hidden;

  .set-scrollbar {
    margin-top: 1rem;
    max-height: calc(30vh);
    transition: max-height 0.3s;

    .loc-info {
      background-color: var(--main-background-light-color);

      &:hover {
        background-color: var(--main-background-hover-color);
      }
    }

    .selected {
      background-color: var(--main-background-color);
      box-shadow: var(--main-box-shadow);
    }
  }
}
</style>
