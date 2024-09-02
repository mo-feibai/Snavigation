<template>
  <!-- 天气时钟 -->
  <div
    :class="[
      'weather-time',
      status.siteStatus,
      status.mainBoxBig && status.siteStatus !== 'normal' && status.siteStatus !== 'focus'
        ? 'hidden'
        : null,
      set.showLunar ? 'lunar' : null,
      set.timeStyle,
    ]"
    @click.stop
  >
    <div
      v-if="set.showWeather"
      v-show="set.timeStyle === 'two' || !props.keyboardState"
      class="weather"
    >
      <div class="weather-info-left">
        <n-avatar
          :size="50"
          :src="`https://a.hecdn.net/img/common/icon/202106d/${weatherData?.icon ?? 100}.png`"
          class="weather-icon"
        />
        <span>{{ set.cityName }}</span>
      </div>
      <div class="weather-info-right">
        <span class="temperature"
          >{{ weatherData?.temp ?? "温度如何" }}<span v-if="weatherData?.temp"> °</span></span
        >
        <span class="status">{{ weatherData?.condition ?? "天气怎样" }}</span>
        <span class="wind"
          >{{ weatherData?.windDir ?? "风向何方" }}
          <span v-if="weatherData?.windLevel" class="wind-level">
            {{ weatherData.windLevel }} 级
          </span></span
        >
      </div>
    </div>

    <div class="date">
      <span class="month">{{ timeData.month ?? "0" }}</span>
      <span class="day">{{ timeData.day ?? "0" }}</span>
      <span class="weekday">{{ timeData.weekday ?? "星期八" }}</span>
    </div>
    <div v-if="set.showLunar" class="lunar">
      <span class="year">{{ timeData.lunar?.GanZhiYear }}</span>
      <span class="text">{{ timeData.lunar?.text }}</span>
    </div>
    <div
      class="time"
      @click.stop="
        status.setSiteStatus(
          status.siteStatus !== 'normal' && status.siteStatus !== 'focus' ? 'normal' : 'box',
        )
      "
    >
      <span class="hour">{{ timeData.hour ?? "00" }}</span>
      <span class="separator" :key="set.showSeconds">:</span>
      <span class="minute">{{ timeData.minute ?? "00" }}</span>
      <Transition name="fade" mode="out-in">
        <span v-if="set.showSeconds" class="second">
          <span class="separator">:</span>
          <span class="second-num">{{ timeData.second ?? "00" }}</span>
        </span>
      </Transition>
      <template v-if="set.use12HourFormat">
        <span class="amPm">{{ timeData.amPm ?? "am" }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { NAvatar } from "naive-ui";
import { getCurrentTime } from "@/utils/timeTools";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { setStore, statusStore } from "@/stores";
import { getWeather } from "@/api";

const set = setStore();
const status = statusStore();

const props = defineProps({
  // 手机软键盘状态，是否弹出
  keyboardState: {
    required: true,
    type: Boolean,
  },
});

// 时间数据
const timeData = ref({});
const timeInterval = ref(null);

// 天气数据
const weatherData = ref(null);
const weatherKey = set.weatherApiKey;

// 更新时间
const updateTimeData = () => {
  timeData.value = getCurrentTime(set.showZeroTime, set.use12HourFormat);
};

// 获取天气数据
const getWeatherData = async () => {
  if (!weatherKey || !set.isValidApiKey) {
    return $message.warning("请在设置中配置正确的天气 Key");
  }
  // 当前时间戳
  const currentTime = Date.now();
  // 上次获取天气数据的数据
  let lastWeatherData = JSON.parse(localStorage.getItem("lastWeatherData")) || {
    data: {},
    lastFetchTime: 0,
  };
  // 上次获取天气数据的时间戳与当前时间的时间差（毫秒）
  const timeDifference = currentTime - lastWeatherData.lastFetchTime;
  // 是否超出 5 分钟
  if (timeDifference >= 5 * 60 * 1000) {
    // 获取天气数据
    const weatherResult = await getWeather(weatherKey, set.cityCode);
    if (weatherResult.data.code !== "200") {
      return $message.error("地区查询失败");
    }
    const data = weatherResult.data.now;
    weatherData.value = {
      condition: data.text,
      temp: data.temp,
      windDir: data.windDir,
      windLevel: data.windScale,
    };
    lastWeatherData = { data: weatherData.value, lastFetchTime: currentTime };
    // 储存新天气数据
    localStorage.setItem("lastWeatherData", JSON.stringify(lastWeatherData));
  } else {
    console.log("从缓存中读取天气数据：", lastWeatherData);
    weatherData.value = lastWeatherData.data;
  }
};

// 监听配置发生改变
watch(
  () => [set.showZeroTime, set.use12HourFormat],
  () => {
    updateTimeData();
  },
);

onMounted(() => {
  // 时间
  updateTimeData();
  timeInterval.value = setInterval(updateTimeData, 1000);
  // 天气
  getWeatherData();
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
});
</script>

<style lang="scss" scoped>
.weather-time {
  position: absolute;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-120px);
  color: var(--main-text-color);
  animation: fade-time-in 0.6s cubic-bezier(0.21, 0.78, 0.36, 1);
  transition:
    transform 0.3s,
    opacity 0.5s,
    margin-bottom 0.3s;
  z-index: 1;

  .time {
    cursor: pointer;
    font-size: 3rem;
    margin: 6px 0;
    text-shadow: var(--main-text-shadow);
    transition: transform 0.3s;

    .separator {
      opacity: 0.8;
      font-size: 2.8rem;
      display: inline-block;
      margin: 0 5px;
      transform: translateY(-4px);
      animation: separator-breathe 0.7s infinite alternate;
    }

    .amPm {
      font-size: 1rem;
      opacity: 0.6;
      margin-left: 6px;
    }

    &:hover {
      transform: scale(1.08);
    }

    &:active {
      transform: scale(1);
    }
  }

  .date {
    font-size: 1.2rem;
    margin: 4px 0;
    text-shadow: var(--main-text-shadow);

    .month {
      &::after {
        margin: 0 4px;
        content: "月";
      }
    }

    .day {
      &::after {
        margin: 0 8px 0 4px;
        content: "日";
      }
    }
  }

  .lunar {
    font-size: 0.8rem;
    opacity: 0.8;
    text-shadow: var(--main-text-shadow);

    .year {
      &::after {
        margin-right: 4px;
        content: "年";
      }
    }
  }

  .weather {
    display: flex;
    font-size: 1rem;
    text-shadow: var(--main-text-shadow);
    gap: 10px;
    margin-bottom: 16px;

    .weather-info-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: 0.7rem;

      .weather-icon {
        background: transparent;
      }
    }

    .weather-info-right {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: start;
      gap: 0.3rem;

      .temperature {
        font-size: 1.4rem;
        line-height: 1;
      }

      .status,
      .wind,
      .wind-level {
        font-size: 0.8rem;
        line-height: 1;
      }
    }
  }

  &.focus {
    transform: translateY(-160px);
    // transform: translateY(-24vh);
  }

  &.box,
  &.set {
    // transform: translateY(-220px);
    transform: translateY(-34vh);
    @media (max-width: 478px) {
      transform: translateY(-32vh);
    }
  }

  &.hidden {
    transform: translateY(-180px);
    // transform: translateY(-24vh);
    opacity: 0;
  }

  &.two {
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: 16px;

    .time {
      display: flex;
      flex-direction: column;
      align-items: center;

      span {
        line-height: 1;
      }

      .separator,
      .second {
        display: none;
      }

      .hour {
        &::after {
          content: "/";
          font-size: 2.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          opacity: 0.4;
          transform: rotate(50deg);
          margin: 20px 0;
        }
      }

      .minute {
        vertical-align: -10px;
      }
    }

    .date {
      display: flex;
      flex-direction: column;
      align-items: center;

      span {
        line-height: 1;
      }

      .month {
        text-align: center;

        &::after {
          content: "月";
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          margin: 12px 0;
        }
      }

      .day {
        &::after {
          content: "日";
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          margin: 12px 0;
        }
      }

      .weekday {
        writing-mode: vertical-rl;
        letter-spacing: 6px;
        text-align: center;
        margin-top: 12px;

        &:before {
          content: "|";
          font-size: 1rem;
          line-height: 0;
          opacity: 0.4;
          margin-bottom: 10px;
        }
      }
    }

    .lunar {
      display: flex;
      flex-direction: column;
      align-items: center;

      span {
        line-height: 1;
      }

      .year {
        writing-mode: vertical-rl;
        letter-spacing: 3px;

        &::after {
          content: "年";
        }
      }

      .text {
        writing-mode: vertical-rl;
        letter-spacing: 3px;
        margin-bottom: 3px;
      }
    }
  }
}
</style>
