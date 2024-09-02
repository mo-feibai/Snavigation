<template>
  <footer id="footer" @click.stop>
    <div
      v-if="set.showHitokoto && hitokoto"
      v-show="status.siteStatus === 'normal' || status.siteStatus === 'focus'"
      class="hitokoto"
    >
      <p class="first">{{ hitokoto?.hitokoto }}</p>
      <p class="last">--- {{ hitokoto?.from }}</p>
    </div>
    <div class="copyright">
      <span class="site-name">{{ siteName }}</span>
      <span class="year">{{ fullYear }}</span>
      <span class="author" @click="jumpTo(copyrightLink ?? 'https://github.com/imsyy/Snavigation')">
        {{ siteAuthor }}
      </span>
      <span v-if="icp" class="icp" @click="jumpTo('https://beian.miit.gov.cn')">
        {{ icp }}
      </span>
      <span class="about" @click="aboutSiteModal = true">关于</span>
    </div>
    <!-- 关于 -->
    <n-modal
      preset="card"
      :bordered="false"
      v-model:show="aboutSiteModal"
      transform-origin="center"
    >
      <div class="about-modal">
        <div class="about">
          <span class="name">{{ siteName }}</span>
          <span class="version">v {{ packageJson.version }}</span>
        </div>
        <div class="desc">
          <n-space class="link" justify="center">
            <n-button strong secondary @click="jumpTo('https://github.com/mo-feibai/Snavigation')">
              Github
            </n-button>
          </n-space>
        </div>
      </div>
    </n-modal>
  </footer>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { setStore, statusStore } from "@/stores";
import { NButton, NModal, NSpace } from "naive-ui";
import packageJson from "@/../package.json";
import { getHitokoto } from "@/api/index.js";

const set = setStore();
const status = statusStore();

// 站点数据
const icp = import.meta.env.VITE_ICP;
const siteName = import.meta.env.VITE_SITE_TITLE;
const siteAuthor = import.meta.env.VITE_SITE_AUTHOR;
const copyrightLink = import.meta.env.VITE_SITE_COPYRIGHTLINK;
const fullYear = new Date().getFullYear();

// 关于弹窗数据
const aboutSiteModal = ref(false);

// 跳转
const jumpTo = (url) => {
  if (set.urlJumpType === "href") {
    window.location.href = url;
  } else if (set.urlJumpType === "open") {
    window.open(url, "_blank");
  }
};

// 一言数据
const hitokoto = ref("");

onMounted(async () => {
  hitokoto.value = (await getHitokoto()).data;
});
</script>

<style lang="scss" scoped>
#footer {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  bottom: 0;
  width: 100%;
  color: var(--main-text-color);
  z-index: 1;

  .copyright {
    display: flex;
    align-items: center;
    font-size: 13px;

    span {
      margin: 0 2px;
      opacity: 0.6;
      transition: opacity 0.3s;

      &::before {
        opacity: 0.6;
        transition: none;
      }
    }

    .year {
      &::before {
        content: "@";
        opacity: 1;
        margin-right: 4px;
      }
    }

    .icp {
      &::before {
        content: "|";
        margin-right: 4px;
      }
    }

    .about {
      &::before {
        content: "|";
        margin-right: 4px;
      }
    }

    .author,
    .icp,
    .about {
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }

  .hitokoto {
    background-color: var(--main-background-light-color);
    margin-bottom: 30px;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    text-align: end;
    transition:
      transform 0.6s ease-in-out,
      background-color 0.6s ease-in-out;
    max-width: 80%;

    .first:before {
      content: "⌈";
      font-size: 40px;
      margin-right: 30px;
    }

    .last:after {
      content: "⌋";
      font-size: 40px;
      padding-left: 30px;
    }

    &:hover {
      background-color: var(--main-background-hover-color);
      transform: scale(1.2);
      text-shadow: 6px 6px 6px rgba(0, 0, 0);
    }
  }
}

.about-modal {
  margin-bottom: 10px;

  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    .name {
      font-size: 26px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .version {
      opacity: 0.6;
      font-size: 16px;
    }
  }

  .desc {
    margin-top: 20px;
  }
}
</style>
