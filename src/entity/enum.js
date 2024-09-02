/**
 * 操作对象
 *
 * @type {Readonly<{CATEGORY: number, BOOKMARK: number}>}
 */
export const OperationSender = Object.freeze({
  /**
   * 类别
   */
  CATEGORY: 1,
  /**
   * 书签
   */
  BOOKMARK: 2,
});

/**
 * 图标类别
 *
 * @type {Readonly<{TEXT: number, URL: number, THIRD_PARTY: number}>}
 */
export const IconType = Object.freeze({
  /**
   * 链接
   */
  URL: 1,
  /**
   * 文本
   */
  TEXT: 2,
  /**
   * 第三方图标
   */
  THIRD_PARTY: 3,
  /**
   * 本地/服务器
   */
  LOCAL_SERVER:4

});

/**
 * 书签排序方式
 *
 * @type {Readonly<{ADD_TIME: number, VISITS: number, ALPHABETICAL_ORDER: number}>}
 */
export const BookmarkSort = Object.freeze({
  /**
   * 添加时间
   */
  ADD_TIME: 1,
  /**
   * 访问次数
   */
  VISITS: 2,
  /**
   * 字母顺序
   */
  ALPHABETICAL_ORDER: 3,
});

/**
 * 背景壁纸类型
 *
 * @type {Readonly<{LOCAL: number, PEOPLE: number, GENERAL: number, ANIME: number, BING: number}>}
 */
export const BackgroundType = Object.freeze({
  /**
   * 本地默认
   */
  LOCAL: 1,
  /**
   * 每日bing
   */
  BING: 2,
  /**
   * 视觉百景
   */
  GENERAL: 3,
  /**
   * 动漫世界
   */
  ANIME: 4,
  /**
   * 人间群像
   */
  PEOPLE: 5,
  /**
   * 自定义
   */
  CUSTOMIZE: 6,
});
