<template>
  <div :class="status.siteStatus !== 'normal' ? 'cover focus' : 'cover'">
    <img
      v-show="status.imgLoadStatus"
      class="background"
      alt="background"
      :src="bgUrl"
      :style="{ '--blur': set.backgroundBlur + 'px' }"
      @load="imgLoadComplete"
      @error.once="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <Transition name="fade">
      <div v-if="set.showBackgroundGray" class="gray" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { statusStore, setStore } from "@/stores";
import { BackgroundType } from "@/entity/enum.js";
import { getWallpaperList } from "@/api/index.js";
import { BACKGROUND_REQUEST, DEFAULT_PAGE_SIZE } from "@/entity/constants.js";

const set = setStore();
const status = statusStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 壁纸随机数
// 请依据文件夹内的图片个数修改 Math.random() 后面的第一个数字
const bgRandom = Math.floor(Math.random() * 3 + 1);

// 赋值壁纸
const setBgUrl = async () => {
  const { backgroundType } = set;
  const isMobile = window.innerWidth < window.innerHeight;
  switch (backgroundType) {
    case BackgroundType.LOCAL:
      bgUrl.value = `/background/bg${bgRandom}.jpg`;
      break;
    case BackgroundType.BING: {
      bgUrl.value = `https://api.dujin.org/bing/${isMobile ? "m" : "1920"}.php`;
      break;
    }
    case BackgroundType.GENERAL:
      bgUrl.value = await getWallpaper(BACKGROUND_REQUEST.CATEGORIES_GENERAL);
      break;
    case BackgroundType.ANIME:
      bgUrl.value = await getWallpaper(BACKGROUND_REQUEST.CATEGORIES_ANIME);
      break;
    case BackgroundType.PEOPLE:
      bgUrl.value = await getWallpaper(BACKGROUND_REQUEST.CATEGORIES_PEOPLE);
      break;
    case BackgroundType.CUSTOMIZE:
      bgUrl.value = set.backgroundCustom;
      break;
    default:
      bgUrl.value = `/background/bg${bgRandom}.jpg`;
      break;
  }
};

// 获取wallhaven图片  curIndex wallpapers
const getWallpaper = async (category) => {
  // 当前时间戳
  const currentTime = Date.now();
  let wallpaperData = JSON.parse(localStorage.getItem("wallpaperData"));

  // 缓存没有数据/当前种类与缓存种类不一致/缓存数据用完，并且距离上一次获取时间超过5分钟，重新获取
  if (
    !wallpaperData ||
    category !== wallpaperData.category ||
    (wallpaperData.curUsedIndex >= DEFAULT_PAGE_SIZE - 1 &&
      currentTime - wallpaperData.lastFetchTime >= 5 * 60 * 1000)
  ) {
    console.log("==更新数据==");
    const wallpaperList = await getWallpaperList(
      BACKGROUND_REQUEST.SORTING,
      BACKGROUND_REQUEST.AI_ART_FILTER,
      BACKGROUND_REQUEST.RATIOS,
      category,
      BACKGROUND_REQUEST.PURITY,
      BACKGROUND_REQUEST.PAGE,
    );
    wallpaperData = {
      curUsedIndex: 0,
      category: category,
      lastFetchTime: currentTime,
      wallpapers: wallpaperList.data,
    };
    localStorage.setItem("wallpaperData", JSON.stringify(wallpaperData));
    return wallpaperList.data.data[wallpaperData.curUsedIndex].path;
  }
  if (wallpaperData.curUsedIndex < DEFAULT_PAGE_SIZE - 1) {
    // 缓存数据没有用完，直接使用缓存数据
    console.log("使用缓存数据curUsedIndex: " + wallpaperData.curUsedIndex);
    wallpaperData.curUsedIndex = ++wallpaperData.curUsedIndex;
  } else {
    // 如果缓存数据用完，并且没有超过5分钟，重新开始
    console.log("==重置壁纸缓存==");
    wallpaperData.curUsedIndex = 0;
  }
  localStorage.setItem("wallpaperData", JSON.stringify(wallpaperData));
  return wallpaperData.wallpapers.data[wallpaperData.curUsedIndex].path;
};

// 图片加载完成
const imgLoadComplete = () => {
  imgTimeout.value = setTimeout(
    () => {
      status.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  $message.error("壁纸加载失败，已临时切换回默认");
  bgUrl.value = `/background/bg${bgRandom}.jpg`;
};

onMounted(() => {
  setBgUrl();
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--body-background-color);

  &.focus {
    .background {
      filter: blur(calc(var(--blur) + 10px)) brightness(0.8);
      transform: scale(1.3);
    }
  }

  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    transform: scale(1.2);
    filter: blur(var(--blur));
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .gray {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
  }
}
</style>
