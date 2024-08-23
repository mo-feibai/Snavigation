// 默认类别key值
export const DEFAULT_TAB_KEY = 0;

// 默认类别名称
export const DEFAULT_TAB_NAME = "默认";

// 默认icon大小
export const DEFAULT_ICON_SIZE = 64;

// 背景壁纸请求
export const BACKGROUND_REQUEST = Object.freeze({
  /**
   * 排序
   */
  SORTING: "random",
  /**
   * 是否过滤AI壁纸（0-false,1-true）
   */
  AI_ART_FILTER: "0",
  /**
   * 比率（landscape-横屏,portrait-竖屏）
   */
  RATIOS: "landscape",
  /**
   * 纯度
   */
  PURITY: "100",
  /**
   * 种类（常规-100,动漫-010,人物-001）
   */
  CATEGORIES_GENERAL: "100",
  CATEGORIES_ANIME: "010",
  CATEGORIES_PEOPLE: "001",
  /**
   * 当前页数
   */
  PAGE: 1,
});

// 默认每页大小
export const DEFAULT_PAGE_SIZE = 24;
