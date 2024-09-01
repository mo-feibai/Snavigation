import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 测试和风api key
 *
 * @param key api key
 * @return {Promise<*>} 数据内容
 */
export const testApiKey = async (key) => {
  return axios({
    method: "GET",
    url: "/geoApi/v2/city/top",
    params: { key, range: "cn", number: 1 },
  });
};

/**
 * 获取和风api位置信息
 *
 * @param key api key
 * @param location 位置关键词
 * @return {Promise<*>} 位置信息
 */
export const getLocationInfo = async (key, location) => {
  return axios({
    method: "GET",
    url: "/geoApi/v2/city/lookup",
    params: { key, location },
  });
};

/**
 * 获取和风api天气信息
 *
 * @param key api ley
 * @param location 位置编码
 * @return {Promise<*>} 及时天气信息
 */
export const getWeather = async (key, location) => {
  return axios({
    method: "GET",
    url: "/weatherApi/v7/weather/now",
    params: { key, location },
  });
};

/**
 * 获取图标信息
 *
 * @param client 客户端
 * @param type 类别
 * @param fallbackOpts 回调配置
 * @param url url
 * @param size 图标大小
 * @return {Promise<null|AxiosResponse<any>>} 图标内容
 */
export const getGoogleFavicon = async (client, type, fallbackOpts, url, size) => {
  // 产生0-3的随机整数
  const randInt = Math.floor(Math.random() * 4);
  try {
    return await axios({
      method: "GET",
      url: `/iconApi/t${randInt}/faviconV2`,
      params: { client, type, fallback_opts: fallbackOpts, url, size },
    });
  } catch (error) {
    console.log("谷歌获取favicon失败", error);
    return null;
  }
};

/**
 * 获取壁纸列表
 *
 * @param sorting 排序方式
 * @param ai_art_filter 是否过滤ai
 * @param ratios 比率
 * @param categories 分类
 * @param purity 纯度
 * @param page 页数
 * @return {Promise<*>} 壁纸列表
 */
export const getWallpaperList = async (
  sorting,
  ai_art_filter,
  ratios,
  categories,
  purity,
  page,
) => {
  return axios({
    method: "GET",
    url: "/wallpaperApi/api/v1/search",
    params: { sorting, ai_art_filter, ratios, categories, purity, page },
  });
};

/**
 * 获取一言
 *
 * @return {Promise<*>} 一言的json信息
 */
export const getHitokoto = async () => {
  return axios({
    method: "GET",
    url: "/hitokotoApi",
  });
};

/**
 * 获取搜索建议
 * https://suggestion.baidu.com
 * @param {String} keyWord - 搜索关键字
 */
export const getSearchSuggestions = async (keyWord) => {
  try {
    const encodedKeyword = encodeURIComponent(keyWord);
    const response = await fetchJsonp(`https://suggestion.baidu.com/su?wd=${encodedKeyword}`, {
      // 回调参数
      jsonpCallback: "cb",
      jsonpCallbackFunction: "json",
    });
    console.log(response);
    const data = await response.json();
    return data.s;
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return null;
  }
};
