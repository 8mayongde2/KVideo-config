const fs = require("fs");
const path = require("path");
const axios = require("axios");

// === 配置 ===
const CONFIG_PATH = path.join(__dirname, "KVideo-config.json"); 
const REPORT_PATH = path.join(__dirname, "report.md");
const MAX_DAYS = 30;
const WARN_STREAK = 3;
const ENABLE_SEARCH_TEST = true;
const SEARCH_KEYWORD = process.argv[2] || "斗罗大陆";
const TIMEOUT_MS = 10000;
const CONCURRENT_LIMIT = 10; 
const MAX_RETRY = 3;

// === 加载配置 ===
if (!fs.existsSync(CONFIG_PATH)) {
  console.error("❌ 配置文件不存在:", CONFIG_PATH);
  process.exit(1);
}

// 核心适配：直接读取数组
const configArray = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

// 适配新字段名：baseUrl 代替了 api
const apiEntries = configArray.map((s) => ({
  name: s.name,
  api: s.baseUrl, 
  detail: s.id || "-", 
  disabled: s.enabled === false, 
}));

// ... [此处保留你原有脚本中关于 history、safeGet、testSearch 和 queueRun 的所有函数代码] ...

// === 主逻辑修改 ===
(async () => {
  console.log("⏳ 正在检测 API（适配数组格式）...");

  const tasks = apiEntries.map(({ name, api, disabled }) => async () => {
    if (disabled) return { name, api, disabled, success: false, searchStatus: "已禁用" };

    const ok = await safeGet(api);
    const searchStatus = ENABLE_SEARCH_TEST ? await testSearch(api, SEARCH_KEYWORD) : "-";
    return { name, api, disabled, success: ok, searchStatus };
  });

  const todayResults = await queueRun(tasks, CONCURRENT_LIMIT);

  // ... [此处保留原有统计和生成 Markdown 的逻辑，但确保引用的是 api 字段] ...
  
  // 生成报告中的表格行适配：
  // md += `| ${s.status} | ${s.name} | ${s.detail} | [接口](${s.api}) | ${s.searchStatus} | ${s.ok} | ${s.fail} | ${s.successRate} | ${s.trend} |\n`;

  fs.writeFileSync(REPORT_PATH, md, "utf-8");
  console.log("📄 报告已生成:", REPORT_PATH);
})();
