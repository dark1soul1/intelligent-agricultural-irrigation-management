<template>
  <div class="app-container home">
    <el-row :gutter="32" class="main-row">
      <!-- 左侧介绍区 -->
      <el-col :xs="24" :md="12" class="intro-col">
        <div class="intro-card">
          <h1 class="main-title">智慧农业灌溉管理系统-管理员端</h1>
          <p class="desc">
            本系统致力于通过物联网、数据分析和智能控制，实现农田灌溉的科学化、精准化和高效化，提升水资源利用率和作物产量。
          </p>
          <el-divider />
          <div class="project-bg">
            <b>项目背景：</b>
            <span>
              在现代农业生产中，水资源的合理利用和精准灌溉是提高农作物产量和质量的关键因素之一。通过引入计算机技术、物联网技术和大数据分析，可以实现对农田灌溉的智能化管理，减少水资源浪费，提高灌溉效率。
            </span>
          </div>
          <div class="version">
            <b>当前版本:</b> <span>v{{ version }}</span>
          </div>
        </div>
      </el-col>
      <!-- 右侧功能区 -->
      <el-col :xs="24" :md="12" class="feature-col">
        <el-card shadow="hover" class="feature-card">
          <template #header>
            <span class="feature-title">主要功能</span>
          </template>
          <el-row :gutter="12">
            <el-col :xs="24" :sm="12">
              <ul class="feature-list">
                <li><el-icon><User /></el-icon> 用户注册与登录（支持手机号/邮箱）</li>
                <li><el-icon><Location /></el-icon> 农田信息管理（位置、面积、作物等）</li>
                <li><el-icon><Calendar /></el-icon> 灌溉计划制定（结合天气数据模拟）</li>
                <li><el-icon><Monitor /></el-icon> 实时监控（土壤湿度、温度等）</li>
              </ul>
            </el-col>
            <el-col :xs="24" :sm="12">
              <ul class="feature-list">
                <li><el-icon><Switch /></el-icon> 灌溉控制（远程模拟开关设备）</li>
                <li><el-icon><TrendCharts /></el-icon> 历史数据查询（灌溉记录、土壤变化）</li>
                <li><el-icon><Reading /></el-icon> 农业知识推送（定期建议与科普）</li>
                <li><el-icon><Setting /></el-icon> 用户/设备/数据分析/系统设置（管理员端）</li>
              </ul>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="32" class="tech-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="tech-card">
          <template #header>
            <span class="tech-title">前端技术栈</span>
          </template>
          <div class="tech-list">
            <el-tag type="success" effect="plain">Vue3</el-tag>
            <el-tag type="info" effect="plain">Pinia</el-tag>
            <el-tag type="primary" effect="plain">Element Plus</el-tag>
            <el-tag type="warning" effect="plain">Axios</el-tag>
            <el-tag type="danger" effect="plain">ECharts</el-tag>
            <el-tag type="">Sass</el-tag>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="tech-card">
          <template #header>
            <span class="tech-title">后端技术栈</span>
          </template>
          <div class="tech-list">
            <el-tag type="primary" effect="plain">Spring Boot</el-tag>
            <el-tag type="info" effect="plain">Spring Security</el-tag>
            <el-tag type="success" effect="plain">JWT</el-tag>
            <el-tag type="warning" effect="plain">MyBatis</el-tag>
            <el-tag type="danger" effect="plain">Druid</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="desc-row">
      <el-col :xs="24" :md="24">
        <el-card class="about-card" shadow="never">
          <template #header>
            <span>系统简介</span>
          </template>
          <div class="about-body">
            <p>
              智慧农业灌溉管理系统为农业生产者和管理者提供一站式的农田信息、灌溉计划、设备控制和数据分析平台，助力现代农业数字化转型。
            </p>
            <p>
              <b>适用场景：</b> 农场、合作社、农业企业、科研院所等。
            </p>
            <p>
              <b>开发团队：</b> 华中农业大学软件设计综合实训项目组
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import { User, Location, Calendar, Monitor, Switch, TrendCharts, Reading, Setting } from '@element-plus/icons-vue'
const version = ref('1.0.0')
</script>

<style scoped lang="scss">
.home {
  font-family: var(--el-font-family, "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif);
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  min-height: 100vh;
  .main-row {
    margin-top: 32px;
    margin-bottom: 24px;
  }
  .intro-col {
    display: flex;
    align-items: center;
    justify-content: center;
    .intro-card {
      background: var(--el-bg-color);
      border-radius: 16px;
      box-shadow: 0 2px 16px 0 rgba(0,0,0,0.04);
      padding: 36px 32px 28px 32px;
      width: 100%;
      min-height: 340px;
    }
    .main-title {
      font-size: calc(var(--el-font-size-large, 18px) * 2);
      font-weight: 700;
      color: var(--el-color-primary);
      margin-bottom: 18px;
    }
    .desc {
      font-size: var(--el-font-size-large, 18px);
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
    }
    .project-bg {
      background: var(--el-fill-color-light, #f0f7ff);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 18px;
      font-size: var(--el-font-size-base, 14px);
      color: var(--el-text-color-regular, #3a3a3a);
    }
    .version {
      margin-top: 18px;
      font-size: var(--el-font-size-base, 14px);
      color: var(--el-text-color-placeholder, #888);
    }
  }
  .feature-col {
    display: flex;
    align-items: center;
    justify-content: center;
    .feature-card {
      width: 100%;
      border-radius: 16px;
      min-height: 340px;
      .feature-title {
        font-size: var(--el-font-size-large, 18px);
        font-weight: 600;
        color: var(--el-color-primary);
      }
      .feature-list {
        padding-left: 0;
        list-style: none;
        margin-bottom: 0;
        li {
          display: flex;
          align-items: center;
          font-size: var(--el-font-size-base, 14px);
          margin-bottom: 12px;
          .el-icon {
            margin-right: 8px;
            font-size: 1.2em;
            color: var(--el-color-success);
          }
        }
      }
    }
  }
  .tech-row {
    margin-top: 16px;
    margin-bottom: 16px;
    .tech-card {
      border-radius: 12px;
      .tech-title {
        font-size: var(--el-font-size-base, 14px);
        font-weight: 600;
        color: var(--el-color-primary);
      }
      .tech-list {
        margin-top: 8px;
        .el-tag {
          margin: 0 8px 8px 0;
          font-size: var(--el-font-size-base, 14px);
        }
      }
    }
  }
  .desc-row {
    margin-bottom: 32px;
    .about-card {
      background: var(--el-fill-color-light, #f6f9f6);
      border-radius: 12px;
      .about-body {
        font-size: var(--el-font-size-base, 14px);
        color: var(--el-text-color-regular, #555);
        p {
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>

