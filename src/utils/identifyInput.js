/**
 * 判断输入的字符串是网址、邮件地址还是普通文本。
 *
 * @param {string} input - 输入的字符串
 * @returns {(string | boolean)} - 返回 "url" 表示网址，"email" 表示邮件地址，true 表示普通文本
 */
export const identifyInput = (input) => {
  /**
   * 网址正则
   * @type {RegExp}
   */
  const urlRegex = new RegExp("https?://[\\w.-]+", "i");

  /**
   * IP 正则
   * @type {RegExp}
   */
  const ipv4Regex = new RegExp(
    "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
  );

  /**
   * 邮箱正则
   * @type {RegExp}
   */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 判断是否为网址
  if (urlRegex.test(input) || ipv4Regex.test(input)) return "url";

  // 判断是否为邮件地址
  if (emailRegex.test(input)) return "email";

  // 默认返回普通文本
  return "text";
};

export const isLocalIP = (url) => {
  try {
    // 提取URL中的主机部分
    const hostname = new URL(url).hostname;

    // 判断是否为IP地址
    const isIP =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        hostname,
      );

    if (!isIP) return false;

    // 判断是否为本地IP
    const localIPPatterns = [
      /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 127.x.x.x (loopback)
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.x.x.x (private network)
      /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/, // 172.16.x.x - 172.31.x.x (private network)
      /^192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.x.x (private network)
    ];

    return localIPPatterns.some((pattern) => pattern.test(hostname));
  } catch (e) {
    // 如果输入字符串不是一个合法的URL，直接判断是否为IP
    const isIP =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        url,
      );

    if (!isIP) return false;

    const localIPPatterns = [
      /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
      /^192\.168\.\d{1,3}\.\d{1,3}$/,
    ];

    return localIPPatterns.some((pattern) => pattern.test(url));
  }
};
