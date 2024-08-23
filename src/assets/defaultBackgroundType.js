import { BackgroundType } from "@/entity/enum.js";

export default [
  {
    "id": BackgroundType.LOCAL,
    "name": "本地默认",
    "tip": "默认壁纸，随机更换",
  },
  {
    "id": BackgroundType.BING,
    "name": "每日必应",
    "tip": "必应每日一图，每天更新",
  },
  {
    "id": BackgroundType.GENERAL,
    "name": "视觉百景",
    "tip": "随机常规图，随机更换",
  },
  {
    "id": BackgroundType.ANIME,
    "name": "动漫世界",
    "tip": "随机动漫二次元图，随机更换",
  },
  {
    "id": BackgroundType.PEOPLE,
    "name": "人间群像",
    "tip": "随机人物图片，随机更换",
  },
];
