import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

// 测试和风api
export const testApiKey = async (key) => {
  return axios({
    method: "GET",
    url: "https://geoapi.qweather.com/v2/city/top",
    params: { key, range: "cn", number: 1 },
  });
};

// 获取和风位置信息
export const getLocationInfo = async (key, location) => {
  return axios({
    method: "GET",
    url: "https://geoapi.qweather.com/v2/city/lookup",
    params: { key, location },
  });
};

// 获取和风天气信息
export const getWeather = async (key, location) => {
  return axios({
    method: "GET",
    url: "https://devapi.qweather.com/v7/weather/now",
    params: { key, location },
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
    const response = await fetchJsonp(
      `https://suggestion.baidu.com/su?wd=${encodedKeyword}&cb=json`,
      {
        // 回调参数
        jsonpCallback: "cb",
      },
    );
    const data = await response.json();
    return data.s;
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return null;
  }
};
