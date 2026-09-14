const TIMES = [
  "10:00",
  "12:00",
  "15:00",
  "19:30",
  "21:00"
];

const STORAGE_KEY =
  "battle-schedule-v1";

const INLINE_ICONS = {
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 10 6 6 6-6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V5h6v2m-8 0 1 13h8l1-13M10 11v4m4-4v4"/></svg>',
  more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
  grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="6" r="1"/><circle cx="16" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7H8.5a2.5 2.5 0 1 1 2.5-2.5V7Zm0 0h3.5A2.5 2.5 0 1 0 12 4.5V7Z"/></svg>'
};

function inlineIcon(name) {
  return `<span class="btn-icon" aria-hidden="true">${INLINE_ICONS[name] || ""}</span>`;
}

let toastTimer = null;

function showToast(message, tone = "info") {
  let toast = document.querySelector(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1800);
}


/* =========================================================
   奖励数据
   ========================================================= */

const REWARD_GENERATIONS = [

  {
    id: "gen-2",
    name: "第2代",

    rewards: [

      {
        id: "health",
        name: "部队生命提升II(12h)",
        shortLabel: "生命提升"
      },

      {
        id: "zoe",
        name: "佐伊碎片"
      },

      {
        id: "teleporter",
        name: "高级迁城"
      },

      {
        id: "speedup",
        name: "1小时通用加速",
        shortLabel: "通用加速"
      },

      {
        id: "damage",
        name: "部队伤害提升II(12h)",
        shortLabel: "伤害提升"
      },

      {
        id: "deployment",
        name: "出征容量提升II(12h)",
        shortLabel: "出征提升"
      },

      {
        id: "100xp",
        name: "100点强化经验部件",
        shortLabel: "装备经验"
      },

      {
        id: "hilde",
        name: "希尔德碎片"
      },

      {
        id: "skill_book",
        name: "传说技能讨伐技能书",
        shortLabel: "讨伐技能书"
      },

      {
        id: "skill_manual",
        name: "传说远征技能书",
        shortLabel: "远征技能书"
      },

      {
        id: "10000xp",
        name: "10000点英雄经验",
        shortLabel: "英雄经验"
      },
      {
        id: "epic_hero_shard",
        name: "史诗英雄信物自选箱",
        shortLabel: "紫色碎片"
      },
    ]

  }

];


/* =========================================================
   奖励工具
   ========================================================= */

function getGenerationById(
  generationId
) {

  return (
    REWARD_GENERATIONS.find(
      generation =>
        generation.id ===
        generationId
    ) || null
  );

}


function getGenerationRewards(
  generationId
) {

  const generation =
    getGenerationById(
      generationId
    );

  return generation
    ? generation.rewards
    : [];

}


function rewardImagePath(
  rewardId
) {

  if (!rewardId) {

    return "";

  }

  return (
    `assets/rewards/${rewardId}.jpg`
  );

}


function getRewardById(
  rewardId,
  generationId
) {

  if (!rewardId) {

    return null;

  }

  const rewards =
    getGenerationRewards(
      generationId
    );

  return (
    rewards.find(
      reward =>
        reward.id ===
        rewardId
    ) || null
  );

}

// 图片中使用奖励的短名称；未填写时继续显示完整名称。
function getRewardDisplayName(reward) {
  return String(
    reward?.shortLabel || reward?.name || ""
  ).trim();
}


function findRewardAnywhere(
  rewardId
) {

  if (!rewardId) {

    return null;

  }

  for (
    const generation
    of REWARD_GENERATIONS
  ) {

    const reward =
      generation.rewards.find(
        item =>
          item.id ===
          rewardId
      );

    if (reward) {

      return {
        reward,
        generation
      };

    }

  }

  return null;

}


/* =========================================================
   默认状态
   ========================================================= */

const DEFAULT_GENERATION =
  REWARD_GENERATIONS[0]
    ? REWARD_GENERATIONS[0].id
    : "";

const DEFAULT_ALLIANCE_FLAG = "assets/default-flag.png";
const DEFAULT_ALLIANCE_NAME = "TBD";
const MAX_FLAG_FILE_BYTES = 2 * 1024 * 1024;
const MAX_FLAG_DIMENSION = 1024;


const defaultState = {

  date:
    todayFallback(),

  title:
    "遗迹作战安排",

  subtitle:
    "Sanctuary Battle Schedule",

  footerMessage:
    "",

  showFooterMessage:
    true,

  alliances: [
    DEFAULT_ALLIANCE_NAME
  ],

  // 每个时间段可单独指定联盟优先顺序；未配置的时间段沿用全局联盟顺序。
  timeAlliancePriority: {},

  allianceDetails: {
    [DEFAULT_ALLIANCE_NAME]: {
      fullName: "",
      flag: DEFAULT_ALLIANCE_FLAG,
      flagName: "默认旗帜"
    }
  },

  rewardGeneration:
    DEFAULT_GENERATION,

  projects: [

    ...Array.from(
      {
        length: 4
      },
      (_, i) => ({

        id:
          `fortress-${i + 1}`,

        type:
          "fortress",

        number:
          i + 1,

        name:
          `${i + 1}号要塞`,

        time:
          "",

        alliance:
          "",

        rewardId:
          ""

      })
    ),

    ...Array.from(
      {
        length: 12
      },
      (_, i) => ({

        id:
          `ruins-${i + 1}`,

        type:
          "ruins",

        number:
          i + 1,

        name:
          `${i + 1}号遗迹`,

        time:
          "",

        alliance:
          "",

        rewardId:
          ""

      })
    )

  ]

};


let state =
  loadState();


let lastSorted = [];


/*
 * Canvas 异步渲染版本。
 *
 * 每次重新绘制都会增加。
 * 如果旧的图片加载完成，就不会覆盖新的画面。
 */
let renderVersion = 0;

let modalEditSnapshot = null;


/* =========================================================
   图片缓存
   ========================================================= */

const imageCache =
  new Map();


/* =========================================================
   DOM 工具
   ========================================================= */

const $ =
  selector =>
    document.querySelector(
      selector
    );


const $$ =
  selector =>
    [
      ...document.querySelectorAll(
        selector
      )
    ];


/* =========================================================
   基础工具
   ========================================================= */

function clone(
  object
) {

  return JSON.parse(
    JSON.stringify(
      object
    )
  );

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    char =>
      ({
        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#39;"

      }[char])
  );

}


function todayFallback() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}


/* =========================================================
   数据兼容
   ========================================================= */

function normalizeState(
  saved
) {

  const result =
    clone(
      defaultState
    );


  if (
    !saved ||
    typeof saved !==
      "object"
  ) {

    return result;

  }


  /* -------------------------------------------------------
     日期
     ------------------------------------------------------- */

  if (
    typeof saved.date ===
    "string"
  ) {

    result.date =
      saved.date;

  }

  if (typeof saved.title === "string") {
    result.title = saved.title.trim() || defaultState.title;
  }

  if (typeof saved.subtitle === "string") {
    result.subtitle = saved.subtitle.trim();
  }

  if (typeof saved.footerMessage === "string") {
    result.footerMessage = saved.footerMessage.trim();
  }

  if (typeof saved.showFooterMessage === "boolean") {
    result.showFooterMessage = saved.showFooterMessage;
  }


  /* -------------------------------------------------------
     联盟
     ------------------------------------------------------- */

  if (
    Array.isArray(
      saved.alliances
    )
  ) {

    result.alliances =
      saved.alliances
        .filter(
          value =>
            typeof value ===
            "string"
        )
        .map(
          value =>
            value.trim()
        )
        .filter(
          Boolean
        );


    if (
      !result.alliances.length
    ) {

      result.alliances =
        clone(
          defaultState.alliances
        );

    }

  }

  if (
    saved.timeAlliancePriority &&
    typeof saved.timeAlliancePriority === "object"
  ) {
    result.timeAlliancePriority = Object.fromEntries(
      TIMES.map(time => [
        time,
        Array.isArray(saved.timeAlliancePriority[time])
          ? saved.timeAlliancePriority[time]
              .filter(alliance =>
                typeof alliance === "string" &&
                result.alliances.includes(alliance)
              )
          : []
      ])
    );
  }

  if (saved.allianceDetails && typeof saved.allianceDetails === "object") {
    result.allianceDetails = Object.fromEntries(
      result.alliances.map(alliance => {
        const detail = saved.allianceDetails[alliance];
        const fallback = defaultState.allianceDetails[alliance] || {};
        return [alliance, {
          fullName: typeof detail?.fullName === "string" ? detail.fullName.trim() : "",
          flag: typeof detail?.flag === "string"
            ? detail.flag
            : (fallback.flag || ""),
          flagName: typeof detail?.flagName === "string"
            ? detail.flagName
            : (fallback.flagName || "")
        }];
      })
    );
  }


  /* -------------------------------------------------------
     奖励代
     ------------------------------------------------------- */

  if (
    typeof saved.rewardGeneration ===
      "string" &&
    getGenerationById(
      saved.rewardGeneration
    )
  ) {

    result.rewardGeneration =
      saved.rewardGeneration;

  }


  /* -------------------------------------------------------
     项目
     ------------------------------------------------------- */

  if (
    Array.isArray(
      saved.projects
    )
  ) {

    result.projects =
      result.projects.map(
        defaultProject => {

          const old =
            saved.projects.find(
              project =>
                project &&
                project.id ===
                  defaultProject.id
            );


          if (!old) {

            return defaultProject;

          }


          let rewardId =
            "";


          if (
            typeof old.rewardId ===
            "string"
          ) {

            rewardId =
              old.rewardId;

          }


          /*
           * 奖励 ID 如果在任何奖励代中都不存在，
           * 才清除。
           */
          if (
            rewardId &&
            !findRewardAnywhere(
              rewardId
            )
          ) {

            rewardId =
              "";

          }


          return {

            ...defaultProject,

            time:
              TIMES.includes(
                old.time
              )
                ? old.time
                : "",

            alliance:
              typeof old.alliance === "string" &&
              result.alliances.includes(old.alliance)
                ? old.alliance
                : "",

            rewardId

          };

        }
      );

  }


  return result;

}


/* =========================================================
   localStorage
   ========================================================= */

function loadState() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!raw) {

      return clone(
        defaultState
      );

    }


    const saved =
      JSON.parse(
        raw
      );


    return normalizeState(
      saved
    );

  } catch (error) {

    console.warn(
      "读取本地数据失败，使用默认数据。",
      error
    );


    showToast("本地数据读取失败，已使用默认数据。请检查浏览器存储权限。", "warning");

    return clone(
      defaultState
    );

  }

}


function saveState() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        state
      )
    );
    return true;

  } catch (error) {

    console.warn(
      "保存数据失败。",
      error
    );
    showToast("保存失败：浏览器存储空间可能已满，请压缩旗帜图片后重试。", "warning");
    return false;

  }

}


/* =========================================================
   图片加载
   ========================================================= */

function loadImage(
  src
) {

  if (!src) {

    return Promise.resolve(
      null
    );

  }


  if (
    imageCache.has(src)
  ) {

    return imageCache.get(
      src
    );

  }


  const promise =
    new Promise(
      resolve => {

        const img =
          new Image();


        img.onload =
          () => {

            resolve(
              img
            );

          };


        img.onerror =
          () => {

            console.warn(
              "图片加载失败：",
              src
            );

            resolve(
              null
            );

          };


        img.src =
          src;

      }
    );


  imageCache.set(
    src,
    promise
  );


  return promise;

}


/* =========================================================
   时间选项
   ========================================================= */

function renderTimeOptions(
  selected = "",
  includeBlank = true
) {

  return (

    (
      includeBlank
        ? `
          <option value="">
            未安排
          </option>
        `
        : ""
    ) +

    TIMES
      .map(
        time =>
          `
          <option
            value="${escapeHtml(time)}"
            ${
              time === selected
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(time)}
          </option>
          `
      )
      .join("")

  );

}


/* =========================================================
   联盟选项
   ========================================================= */

function renderAllianceOptions(
  selected = "",
  includeBlank = true
) {

  return (

    (
      includeBlank
        ? `
          <option value="">
            未选择
          </option>
        `
        : ""
    ) +

    state.alliances
      .map(
        alliance =>
          `
          <option
            value="${escapeHtml(alliance)}"
            ${
              alliance === selected
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(alliance)}
          </option>
          `
      )
      .join("")

  );

}

function renderTimeAlliancePriority() {
  const list = $("#timePriorityList");

  if (!list) return;

  list.innerHTML = TIMES.map(time => {
    const selected = state.timeAlliancePriority[time] || [];

    return `
      <label class="time-priority-row">
        <span>${escapeHtml(time)}</span>
        <select class="time-priority-select" data-time="${escapeHtml(time)}" multiple size="${Math.min(Math.max(state.alliances.length, 2), 4)}">
          ${state.alliances.map(alliance => `
            <option value="${escapeHtml(alliance)}" ${selected.includes(alliance) ? "selected" : ""}>
              ${escapeHtml(alliance)}
            </option>
          `).join("")}
        </select>
      </label>
    `;
  }).join("");

  list.querySelectorAll(".time-priority-select").forEach(select => {
    select.addEventListener("change", event => {
      const time = event.target.dataset.time;
      state.timeAlliancePriority[time] = [...event.target.selectedOptions]
        .map(option => option.value);
      saveState();
      updateOutput();
    });
  });
}


/* =========================================================
   奖励选项
   ========================================================= */

function renderRewardOptions(
  selected = "",
  includeBlank = true
) {

  const rewards =
    getGenerationRewards(
      state.rewardGeneration
    );


  return (

    (
      includeBlank
        ? `
          <option value="">
            未选择奖励
          </option>
        `
        : ""
    ) +

    rewards
      .map(
        reward =>
          `
          <option
            value="${escapeHtml(
              reward.id
            )}"
            ${
              reward.id === selected
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(
              reward.name
            )}
          </option>
          `
      )
      .join("")

  );

}


/* =========================================================
   奖励版本选择
   ========================================================= */

function renderGenerationOptions() {

  let select =
    $("#rewardGeneration");


  if (!select) {

    const bulkTools =
      $(".bulk-tools");


    if (!bulkTools) {

      return;

    }


    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "generation-selector";


    wrapper.innerHTML = `
      <div>
        <strong>奖励版本</strong>
        <small>
          选择本次使用的奖励代
        </small>
      </div>

      <select id="rewardGeneration"></select>
    `;


    bulkTools.before(
      wrapper
    );


    select =
      wrapper.querySelector(
        "#rewardGeneration"
      );

  }


  if (!select) {

    return;

  }


  select.innerHTML =
    REWARD_GENERATIONS
      .map(
        generation =>
          `
          <option
            value="${escapeHtml(
              generation.id
            )}"
            ${
              generation.id ===
              state.rewardGeneration
                ? "selected"
                : ""
            }
          >
            ${escapeHtml(
              generation.name
            )}
          </option>
          `
      )
      .join("");


  if (
    select.dataset.bound ===
    "true"
  ) {

    return;

  }


  select.dataset.bound =
    "true";


  select.addEventListener(
    "change",
    () => {

      state.rewardGeneration =
        select.value;


      saveState();


      renderProjects();


      updateOutput();

    }
  );

}


/* =========================================================
   奖励区域样式
   ========================================================= */

function injectRewardStyles() {

  if (
    $("#dynamicRewardStyles")
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "dynamicRewardStyles";


  style.textContent = `

    .generation-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 8px;
      margin-bottom: 8px;
      padding: 9px 10px;
      border-radius: 8px;
      background: var(--paper-2);
      border: 1px solid var(--line);
    }

    .generation-selector > div {
      min-width: 0;
    }

    .generation-selector strong {
      display: block;
      color: var(--ink);
      font-size: 12px;
      font-weight: 800;
    }

    .generation-selector small {
      display: block;
      margin-top: 2px;
      color: var(--muted);
      font-size: 9px;
    }

    .generation-selector select {
      width: 130px;
      min-width: 100px;
      height: 30px;
    }

    .reward-assignment {
      margin-top: 6px;
      margin-bottom: 6px;
      padding: 8px;
      border-radius: 7px;
      background: var(--paper-2);
      border: 1px dashed var(--line);
    }

    .reward-assignment-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 5px;
      color: var(--muted);
      font-size: 10px;
      font-weight: 800;
    }

    .reward-assignment-list {
      display: grid;
      gap: 3px;
    }

    .reward-assignment-row {
      display: grid;
      grid-template-columns:
        minmax(0, 1fr)
        minmax(120px, 180px);
      gap: 6px;
      align-items: center;
      min-height: 29px;
    }

    .reward-assignment-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink);
      font-size: 11px;
      font-weight: 700;
    }

    .reward-assignment-row select {
      width: 100%;
      height: 28px;
      min-width: 0;
      padding: 0 5px;
      font-size: 10px;
    }

    @media (max-width: 480px) {

      .generation-selector {
        align-items: stretch;
        flex-direction: column;
      }

      .generation-selector select {
        width: 100%;
      }

      .reward-assignment-row {
        grid-template-columns:
          minmax(0, 1fr)
          120px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   奖励分配
   ========================================================= */

function renderRewardAssignments(
  type
) {

  const container =
    type === "fortress"
      ? $("#fortressEditor")
      : $("#ruinsEditor");


  if (!container) {

    return;

  }


  let assignment =
    container.parentElement.querySelector(
      `.reward-assignment[data-type="${type}"]`
    );


  if (!assignment) {

    assignment =
      document.createElement(
        "div"
      );


    assignment.className =
      "reward-assignment";


    assignment.dataset.type =
      type;


    container.after(
      assignment
    );

  }


  const projects =
    state.projects.filter(
      project =>
        project.type ===
        type
    );


  const generation =
    getGenerationById(
      state.rewardGeneration
    );


  const generationName =
    generation
      ? generation.name
      : "未选择";


  const assignedCount =
    projects.filter(
      project =>
        getRewardById(
          project.rewardId,
          state.rewardGeneration
        )
    ).length;


  assignment.innerHTML = `

    <div class="reward-assignment-title">

      <span>
        奖励分配 ·
        ${escapeHtml(
          generationName
        )}
      </span>

      <span>
        ${assignedCount}/${projects.length}
      </span>

    </div>

    <div class="reward-assignment-list">

      ${projects
        .map(
          project => {

            const selected =
              getRewardById(
                project.rewardId,
                state.rewardGeneration
              )
                ? project.rewardId
                : "";


            return `
              <div
                class="reward-assignment-row"
                data-id="${escapeHtml(
                  project.id
                )}"
              >

                <div
                  class="reward-assignment-name"
                >
                  ${escapeHtml(
                    project.name
                  )}
                </div>

                <select
                  class="reward-assignment-select"
                  aria-label="${escapeHtml(
                    project.name
                  )}奖励"
                >

                  ${renderRewardOptions(
                    selected
                  )}

                </select>

              </div>
            `;

          }
        )
        .join("")}

    </div>

  `;


  assignment
    .querySelectorAll(
      ".reward-assignment-select"
    )
    .forEach(
      select => {

        select.addEventListener(
          "change",
          event => {

            const row =
              event.target.closest(
                ".reward-assignment-row"
              );


            if (!row) {

              return;

            }


            const project =
              state.projects.find(
                item =>
                  item.id ===
                  row.dataset.id
              );


            if (!project) {

              return;

            }


            project.rewardId =
              event.target.value;


            saveState();


            renderRewardAssignments(
              type
            );


            updateOutput();

          }
        );

      }
    );

}


/* =========================================================
   联盟
   ========================================================= */

function renderAlliances() {

  const list =
    $("#allianceList");


  if (!list) {

    return;

  }

  if (!document.body.dataset.allianceMenuOutsideBound) {
    document.body.dataset.allianceMenuOutsideBound = "true";
    document.addEventListener("click", event => {
      if (event.target.closest(".alliance-action-menu")) return;
      document.querySelectorAll(".alliance-action-menu[open]").forEach(menu => {
        menu.removeAttribute("open");
      });
    });
  }


  list.innerHTML =
    state.alliances
      .map(
        (
          name,
          index
        ) => `

          <div
            class="alliance-item"
            data-index="${index}"
          >

            <span
              class="drag-handle"
            >
              ${inlineIcon("grip")}
            </span>

            <input
              class="alliance-name"
              value="${escapeHtml(
                name
              )}"
              aria-label="联盟名称"
            />

            <input
              class="alliance-full-name"
              value="${escapeHtml(state.allianceDetails[name]?.fullName || "")}" 
              placeholder="全名（选填）"
              aria-label="联盟全名（选填）"
            />

            <label
              class="alliance-flag-label"
              title="${escapeHtml(state.allianceDetails[name]?.flagName || "未上传旗帜")}" 
            >
              <span class="alliance-flag-preview">
                <img src="${escapeHtml(state.allianceDetails[name]?.flag || DEFAULT_ALLIANCE_FLAG)}" alt="" width="28" height="28" />
              </span>
              <span class="alliance-flag-status">
                ${escapeHtml(state.allianceDetails[name]?.flagName || "上传旗帜")}
              </span>
              <input class="alliance-flag" type="file" aria-label="选择联盟旗帜图片文件（选填）" />
            </label>

            <details class="alliance-action-menu">
            <summary aria-label="更多联盟操作">${inlineIcon("more")}</summary>
            <div class="alliance-actions">
            <button type="button"
              class="icon-btn move-up"
              title="上移"
              ${
                index === 0
                  ? "disabled"
                  : ""
              }
            >
              ${inlineIcon("up")}
            </button>

            <button type="button"
              class="icon-btn move-down"
              title="下移"
              ${
                index ===
                state.alliances.length - 1
                  ? "disabled"
                  : ""
              }
            >
              ${inlineIcon("down")}
            </button>

            <button type="button"
              class="icon-btn delete-alliance"
              title="删除"
            >
              ${inlineIcon("trash")}
            </button>

            <button type="button"
              class="icon-btn delete-flag"
              title="删除旗帜"
              aria-label="删除旗帜"
            >
              ${inlineIcon("trash")}
            </button>
            </div>
            </details>

          </div>

        `
      )
      .join("");


  list
    .querySelectorAll(
      ".alliance-name"
    )
    .forEach(
      input => {

        input.addEventListener(
          "change",
          () => {

            const item =
              input.closest(
                ".alliance-item"
              );


            const index =
              Number(
                item.dataset.index
              );


            const old =
              state.alliances[index];


            const next =
              input.value.trim();


            if (!next) {

              input.value =
                old;

              return;

            }


            if (
              state.alliances.some(
                (
                  alliance,
                  i
                ) =>
                  i !== index &&
                  alliance === next
              )
            ) {

              input.value =
                old;


              showToast("联盟名称不能重复。", "warning");


              return;

            }


            state.alliances[index] =
              next;

            if (state.allianceDetails[old]) {
              state.allianceDetails[next] = state.allianceDetails[old];
              delete state.allianceDetails[old];
            }


            state.projects.forEach(
              project => {

                if (
                  project.alliance ===
                  old
                ) {

                  project.alliance =
                    next;

                }

              }
            );

            Object.keys(state.timeAlliancePriority).forEach(time => {
              state.timeAlliancePriority[time] =
                state.timeAlliancePriority[time].map(alliance =>
                  alliance === old ? next : alliance
                );
            });


            saveState();


            renderAll();

          }
        );

      }
    );


  list.querySelectorAll(".alliance-full-name").forEach(input => {
    input.addEventListener("change", () => {
      const item = input.closest(".alliance-item");
      const name = state.alliances[Number(item.dataset.index)];
      state.allianceDetails[name] = state.allianceDetails[name] || {};
      state.allianceDetails[name].fullName = input.value.trim();
      saveState();
      updateOutput();
    });
  });

  list.querySelectorAll(".alliance-flag").forEach(input => {
    input.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        input.value = "";
        showToast("请选择图片格式的旗帜文件。", "warning");
        return;
      }
      if (file.size > MAX_FLAG_FILE_BYTES) {
        input.value = "";
        showToast("旗帜图片请控制在 2MB 以内。", "warning");
        return;
      }
      const item = input.closest(".alliance-item");
      const name = state.alliances[Number(item.dataset.index)];
      const label = input.closest(".alliance-flag-label");
      const status = label?.querySelector(".alliance-flag-status");
      if (status) status.textContent = "读取中…";
      label?.setAttribute("aria-busy", "true");
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          if (image.width > MAX_FLAG_DIMENSION || image.height > MAX_FLAG_DIMENSION) {
            if (status) status.textContent = "上传旗帜";
            label?.setAttribute("aria-busy", "false");
            input.value = "";
            showToast(`旗帜图片尺寸不能超过 ${MAX_FLAG_DIMENSION}×${MAX_FLAG_DIMENSION} 像素。`, "warning");
            return;
          }
          state.allianceDetails[name] = state.allianceDetails[name] || {};
          state.allianceDetails[name].flag = reader.result;
          state.allianceDetails[name].flagName = file.name;
          saveState();
          const preview = label?.querySelector(".alliance-flag-preview");
          if (status) status.textContent = file.name;
          if (label) label.title = file.name;
          label?.setAttribute("aria-busy", "false");
          if (preview) preview.innerHTML = `<img src="${reader.result}" alt="" width="28" height="28" />`;
          updateOutput();
        };
        image.onerror = () => {
          if (status) status.textContent = "上传旗帜";
          label?.setAttribute("aria-busy", "false");
          input.value = "";
          showToast("旗帜图片读取失败，请重试。", "warning");
        };
        image.src = reader.result;
      };
      reader.onerror = () => {
        if (status) status.textContent = "上传旗帜";
        label?.setAttribute("aria-busy", "false");
        input.value = "";
        showToast("旗帜图片读取失败，请重试。", "warning");
      };
      reader.readAsDataURL(file);
    });
  });

  list
    .querySelectorAll(
      ".move-up"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button
                  .closest(
                    ".alliance-item"
                  )
                  .dataset
                  .index
              );


            moveAlliance(
              index,
              -1
            );

          }
        );

      }
    );


  list
    .querySelectorAll(
      ".move-down"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button
                  .closest(
                    ".alliance-item"
                  )
                  .dataset
                  .index
              );


            moveAlliance(
              index,
              1
            );

          }
        );

      }
    );


  list
    .querySelectorAll(
      ".delete-alliance"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button
                  .closest(
                    ".alliance-item"
                  )
                  .dataset
                  .index
              );


            deleteAlliance(
              index
            );

          }
        );

      }
    );

  list
    .querySelectorAll(
      ".delete-flag"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          event => {
            event.preventDefault();
            event.stopPropagation();
            const item = button.closest(".alliance-item");
            const name = state.alliances[Number(item.dataset.index)];
            const detail = state.allianceDetails[name] || {};
            state.allianceDetails[name] = detail;

            detail.flag = "";
            detail.flagName = "";
            saveState();
            renderAlliances();
            updateOutput();
            showToast("旗帜已删除。", "success");
          }
        );
      }
    );

}


/* =========================================================
   联盟移动
   ========================================================= */

function moveAlliance(
  index,
  direction
) {

  const target =
    index + direction;


  if (
    target < 0 ||
    target >=
      state.alliances.length
  ) {

    return;

  }


  [
    state.alliances[index],
    state.alliances[target]
  ] = [
    state.alliances[target],
    state.alliances[index]
  ];


  saveState();


  renderAll();

}


/* =========================================================
   删除联盟
   ========================================================= */

function deleteAlliance(
  index
) {

  const name =
    state.alliances[index];


  if (
    !confirm(
      `删除联盟「${name}」？已分配该联盟的项目会变成未选择。`
    )
  ) {

    return;

  }


  state.alliances.splice(
    index,
    1
  );

  delete state.allianceDetails[name];

  Object.keys(state.timeAlliancePriority).forEach(time => {
    state.timeAlliancePriority[time] =
      state.timeAlliancePriority[time].filter(alliance => alliance !== name);
  });


  state.projects.forEach(
    project => {

      if (
        project.alliance ===
        name
      ) {

        project.alliance =
          "";

      }

    }
  );


  saveState();


  renderAll();

}


/* =========================================================
   项目
   ========================================================= */

function renderProjectReward(project) {
  const selected = getRewardById(project.rewardId, state.rewardGeneration);
  const rewards = getGenerationRewards(state.rewardGeneration);
  const selectedName = selected ? getRewardDisplayName(selected) : "";

  return `
    <div class="project-reward" data-project-reward="${escapeHtml(project.id)}">
      <span class="project-reward-label">奖励</span>
      <button type="button" class="project-reward-trigger" title="${escapeHtml(selectedName || "选择奖励")}" aria-label="${escapeHtml(project.name)}奖励" aria-haspopup="listbox" aria-expanded="false">
        <span class="project-reward-preview">
          ${selected ? `<img src="${escapeHtml(rewardImagePath(selected.id))}" alt="" width="22" height="22" loading="lazy" />` : inlineIcon("gift")}
        </span>
        <span class="project-reward-arrow">${inlineIcon("down")}</span>
      </button>
      <div class="project-reward-menu" role="listbox" aria-label="${escapeHtml(project.name)}奖励选项">
        <button type="button" class="project-reward-option" role="option" aria-selected="${project.rewardId ? "false" : "true"}" data-reward-id="">
          <span class="project-reward-preview">${inlineIcon("gift")}</span>
          <span>未选择奖励</span>
        </button>
        ${rewards.map(reward => `
          <button type="button" class="project-reward-option${reward.id === project.rewardId ? " is-selected" : ""}" role="option" aria-selected="${reward.id === project.rewardId ? "true" : "false"}" data-reward-id="${escapeHtml(reward.id)}">
            <span class="project-reward-preview"><img src="${escapeHtml(rewardImagePath(reward.id))}" alt="" width="22" height="22" loading="lazy" /></span>
            <span>${escapeHtml(getRewardDisplayName(reward))}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderProjects() {

  if (!document.body.dataset.rewardOutsideBound) {
    document.body.dataset.rewardOutsideBound = "true";
    document.addEventListener("click", event => {
      if (event.target.closest(".project-reward")) return;
      document.querySelectorAll(".project-reward.is-open").forEach(item => {
        item.classList.remove("is-open");
        item.querySelector(".project-reward-trigger")?.setAttribute("aria-expanded", "false");
      });
    });
  }

  for (
    const type of [
      "fortress",
      "ruins"
    ]
  ) {

    const container =
      type === "fortress"
        ? $("#fortressEditor")
        : $("#ruinsEditor");


    if (!container) {

      continue;

    }


    const projects =
      state.projects.filter(
        project =>
          project.type ===
          type
      );


    container.innerHTML =
      projects
        .map(
          project => `

            <div
              class="project-row ${project.time && project.alliance ? "is-assigned" : "is-unassigned"}"
              data-id="${escapeHtml(
                project.id
              )}"
            >

              <input
                class="check project-check"
                type="checkbox"
                aria-label="选择${escapeHtml(
                  project.name
                )}"
              />

              <div class="project-name">
                ${escapeHtml(
                  project.name
                )}
              </div>

              <select
                class="time-select"
                aria-label="${escapeHtml(
                  project.name
                )}开始时间"
              >

                ${renderTimeOptions(
                  project.time
                )}

              </select>

              <select
                class="alliance-select"
                aria-label="${escapeHtml(
                  project.name
                )}参加联盟"
              >

                ${renderAllianceOptions(
                  project.alliance
                )}

              </select>

              ${renderProjectReward(project)}

            </div>

          `
        )
        .join("");


    container
      .querySelectorAll(
        ".project-row"
      )
      .forEach(
        row => {

          const project =
            state.projects.find(
              item =>
                item.id ===
                row.dataset.id
            );


          if (!project) {

            return;

          }


          const timeSelect =
            row.querySelector(
              ".time-select"
            );


          const allianceSelect =
            row.querySelector(
              ".alliance-select"
            );


          if (timeSelect) {

            timeSelect.addEventListener(
              "change",
              event => {

                project.time =
                  event.target.value;


                saveState();


                updateOutput();
                updateProjectArrangementSummary();

              }
            );

          }


          if (allianceSelect) {

            allianceSelect.addEventListener(
              "change",
              event => {

                project.alliance =
                  event.target.value;


                saveState();


                updateOutput();
                updateProjectArrangementSummary();

              }
            );

          }

        }
      );


    container.onclick = event => {
      const trigger = event.target.closest(".project-reward-trigger");
      const option = event.target.closest(".project-reward-option");
      const reward = event.target.closest(".project-reward");

      if (trigger && reward) {
        event.stopPropagation();
        container.querySelectorAll(".project-reward.is-open").forEach(item => {
          if (item !== reward) {
            item.classList.remove("is-open");
            item.querySelector(".project-reward-trigger")?.setAttribute("aria-expanded", "false");
          }
        });
        const isOpen = reward.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
        return;
      }

      if (option && reward) {
        const row = option.closest(".project-row");
        const project = state.projects.find(item => item.id === row?.dataset.id);
        if (!project) return;
        project.rewardId = option.dataset.rewardId || "";
        saveState();
        renderProjects();
        updateOutput();
      }
    };

    container.onkeydown = event => {
      const trigger = event.target.closest(".project-reward-trigger");
      const option = event.target.closest(".project-reward-option");
      const reward = event.target.closest(".project-reward");
      if (!reward || (!trigger && !option)) return;

      if (trigger && ["Enter", " ", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        const wasOpen = reward.classList.contains("is-open");
        reward.classList.toggle("is-open", !wasOpen);
        trigger.setAttribute("aria-expanded", String(!wasOpen));
        if (!wasOpen) {
          (reward.querySelector(".project-reward-option.is-selected") || reward.querySelector(".project-reward-option"))?.focus();
        }
        return;
      }

      if (!option) return;
      const options = [...reward.querySelectorAll(".project-reward-option")];
      const index = options.indexOf(option);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        options[(index + direction + options.length) % options.length]?.focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        options[event.key === "Home" ? 0 : options.length - 1]?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        reward.classList.remove("is-open");
        reward.querySelector(".project-reward-trigger")?.setAttribute("aria-expanded", "false");
        reward.querySelector(".project-reward-trigger")?.focus();
      }
    };

    container.parentElement.querySelector(`.reward-assignment[data-type="${type}"]`)?.remove();

  }

}


/* =========================================================
   批量工具
   ========================================================= */

function updateProjectArrangementSummary() {
  const summary = $("#editorSummary");
  if (!summary) return;

  const total = state.projects.length;
  const assigned = state.projects.filter(project => project.time && project.alliance).length;
  const remaining = Math.max(0, total - assigned);
  summary.textContent = remaining
    ? `已安排 ${assigned} / ${total} · 还有 ${remaining} 个未安排`
    : `已安排 ${assigned} / ${total} · 全部完成`;

  ["fortress", "ruins"].forEach(type => {
    const projects = state.projects.filter(project => project.type === type);
    const done = projects.filter(project => project.time && project.alliance).length;
    const heading = document.querySelector(`[data-group-heading="${type}"]`);
    const count = heading?.querySelector(".group-count");
    const status = heading?.querySelector(`[data-group-status="${type}"]`);
    if (count) count.textContent = projects.length;
    if (status) status.textContent = `${done} / ${projects.length}`;
  });
}

function renderBulk() {

  const bulkTime =
    $("#bulkTime");


  const bulkAlliance =
    $("#bulkAlliance");


  if (bulkTime) {

    bulkTime.innerHTML =
      renderTimeOptions(
        "",
        true
      );

  }


  if (bulkAlliance) {

    bulkAlliance.innerHTML =
      renderAllianceOptions(
        "",
        true
      );

  }

}


/* =========================================================
   批量设置
   ========================================================= */

const applyBulkBtn =
  $("#applyBulkBtn");


if (applyBulkBtn) {

  applyBulkBtn.addEventListener(
    "click",
    () => {

      const time =
        $("#bulkTime")
          ? $("#bulkTime").value
          : "";


      const alliance =
        $("#bulkAlliance")
          ? $("#bulkAlliance").value
          : "";


      const selected =
        $$ (
          ".project-check:checked"
        );


      if (!selected.length) {

        showToast("请先选择项目。", "warning");


        return;

      }


      selected.forEach(
        checkbox => {

          const row =
            checkbox.closest(
              ".project-row"
            );


          if (!row) {

            return;

          }


          const project =
            state.projects.find(
              item =>
                item.id ===
                row.dataset.id
            );


          if (!project) {

            return;

          }


          if (time) {

            project.time =
              time;

          }


          if (alliance) {

            project.alliance =
              alliance;

          }

        }
      );


      saveState();


      renderProjects();


      updateOutput();

    }
  );

}


/* =========================================================
   全选
   ========================================================= */

$$(
  "[data-select-group]"
).forEach(
  checkbox => {

    checkbox.addEventListener(
      "change",
      event => {

        const type =
          event.target.dataset
            .selectGroup;


        $$(".project-row")
          .forEach(
            row => {

              const project =
                state.projects.find(
                  item =>
                    item.id ===
                    row.dataset.id
                );


              if (
                project &&
                project.type ===
                  type
              ) {

                const check =
                  row.querySelector(
                    ".project-check"
                  );


                if (check) {

                  check.checked =
                    event.target.checked;

                }

              }

            }
          );

      }
    );

  }
);


/* =========================================================
   清空安排
   ========================================================= */

const clearAssignmentsBtn =
  $("#clearAssignmentsBtn");


if (clearAssignmentsBtn) {

  clearAssignmentsBtn.addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "清空全部项目的时间、联盟和奖励？"
        )
      ) {

        return;

      }


      state.projects.forEach(
        project => {

          project.time =
            "";

          project.alliance =
            "";

          project.rewardId =
            "";

        }
      );


      saveState();


      renderAll();

    }
  );

}


/* =========================================================
   恢复默认
   ========================================================= */

const resetBtn =
  $("#resetBtn");


if (resetBtn) {

  resetBtn.addEventListener(
    "click",
    () => {

      if (
        !confirm(
          "恢复默认联盟、奖励版本和全部未安排状态？"
        )
      ) {

        return;

      }


      state =
        clone(
          defaultState
        );


      saveState();


      renderAll();

    }
  );

}


/* =========================================================
   添加联盟
   ========================================================= */

const clearCacheBtn = $("#clearCacheBtn");

if (clearCacheBtn) {
  clearCacheBtn.addEventListener("click", () => {
    if (!confirm("清除后会删除当前日期、联盟、项目安排和奖励设置，是否继续？")) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLLAPSE_STORAGE_KEY);
    } catch (error) {
      console.warn("清除本地缓存失败", error);
    }

    imageCache.clear();
    state = clone(defaultState);
    document.querySelectorAll(".modal-panel.is-open").forEach((panel) => {
      panel.classList.remove("is-open");
    });
    document.body.classList.remove("modal-open");
    renderAll();
  });
}

const addAllianceBtn =
  $("#addAllianceBtn");


if (addAllianceBtn) {

  addAllianceBtn.addEventListener(
    "click",
    () => {

      const value =
        prompt(
          "请输入联盟名称："
        );


      if (!value) {

        return;

      }


      const name =
        value.trim();


      if (!name) {

        return;

      }


      if (
        state.alliances.includes(
          name
        )
      ) {

        showToast("这个联盟已经存在。", "warning");


        return;

      }


      state.alliances.push(
        name
      );

      state.allianceDetails[name] = {
        fullName: "",
        flag: "",
        flagName: ""
      };


      saveState();


      renderAll();

    }
  );

}


/* =========================================================
   排序
   ========================================================= */

function allianceRank(
  alliance
) {

  const index =
    state.alliances.indexOf(
      alliance
    );


  return index === -1
    ? 9999
    : index;

}

function timeAllianceRank(time, alliance) {
  const priority = state.timeAlliancePriority[time] || [];
  const priorityIndex = priority.indexOf(alliance);

  if (priorityIndex !== -1) return priorityIndex;

  // 未指定联盟排在该时间段的优先联盟之后，并保持全局顺序。
  return priority.length + allianceRank(alliance);
}


function typeRank(
  type
) {

  return type ===
    "fortress"
    ? 0
    : 1;

}


function getSortedProjects() {

  return state.projects
    .filter(
      project =>
        project.time &&
        project.alliance
    )
    .slice()
    .sort(
      (
        a,
        b
      ) => {

        const timeA =
          TIMES.indexOf(
            a.time
          );


        const timeB =
          TIMES.indexOf(
            b.time
          );


        if (
          timeA !==
          timeB
        ) {

          return (
            timeA -
            timeB
          );

        }


        const allianceA =
          timeAllianceRank(
            a.time,
            a.alliance
          );


        const allianceB =
          timeAllianceRank(
            b.time,
            b.alliance
          );


        if (
          allianceA !==
          allianceB
        ) {

          return (
            allianceA -
            allianceB
          );

        }


        const typeA =
          typeRank(
            a.type
          );


        const typeB =
          typeRank(
            b.type
          );


        if (
          typeA !==
          typeB
        ) {

          return (
            typeA -
            typeB
          );

        }


        return (
          Number(a.number) -
          Number(b.number)
        );

      }
    );

}


/* =========================================================
   Canvas 辅助
   ========================================================= */

function roundedRect(
  ctx,
  x,
  y,
  w,
  h,
  r
) {

  const radius =
    Math.min(
      r,
      w / 2,
      h / 2
    );


  ctx.beginPath();


  ctx.moveTo(
    x + radius,
    y
  );


  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    radius
  );


  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    radius
  );


  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    radius
  );


  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    radius
  );


  ctx.closePath();

}


/* =========================================================
   右对齐文本截断
   ========================================================= */

function drawEllipsisText(
  ctx,
  text,
  rightX,
  y,
  maxWidth
) {

  const value =
    String(
      text ?? ""
    );


  if (
    ctx.measureText(value).width <=
    maxWidth
  ) {

    ctx.fillText(
      value,
      rightX,
      y
    );


    return;

  }


  const ellipsis =
    "...";


  const ellipsisWidth =
    ctx.measureText(
      ellipsis
    ).width;


  let result =
    "";


  for (
    const char of value
  ) {

    const test =
      result + char;


    if (
      ctx.measureText(
        test
      ).width +
        ellipsisWidth >
      maxWidth
    ) {

      break;

    }


    result =
      test;

  }


  ctx.fillText(
    result + ellipsis,
    rightX,
    y
  );

}

function drawLeftEllipsisText(ctx, text, leftX, y, maxWidth) {
  const value = String(text ?? "");
  if (ctx.measureText(value).width <= maxWidth) {
    ctx.fillText(value, leftX, y);
    return;
  }

  let truncated = "";
  for (const character of value) {
    if (ctx.measureText(`${truncated}${character}…`).width > maxWidth) break;
    truncated += character;
  }
  ctx.fillText(`${truncated}…`, leftX, y);
}


/* =========================================================
   要塞图标
   ========================================================= */

function drawCastleIcon(
  ctx,
  cx,
  cy,
  s
) {

  ctx.save();


  ctx.strokeStyle =
    "#8e4d2a";


  ctx.lineWidth =
    2 * s;


  ctx.beginPath();


  ctx.moveTo(
    cx - 34 * s,
    cy + 22 * s
  );


  ctx.lineTo(
    cx - 34 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx - 22 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx - 22 * s,
    cy - 22 * s
  );


  ctx.lineTo(
    cx - 10 * s,
    cy - 22 * s
  );


  ctx.lineTo(
    cx - 10 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx + 10 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx + 10 * s,
    cy - 22 * s
  );


  ctx.lineTo(
    cx + 22 * s,
    cy - 22 * s
  );


  ctx.lineTo(
    cx + 22 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx + 34 * s,
    cy - 8 * s
  );


  ctx.lineTo(
    cx + 34 * s,
    cy + 22 * s
  );


  ctx.closePath();


  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   遗迹图标
   ========================================================= */

function drawRuinIcon(
  ctx,
  cx,
  cy,
  s
) {

  ctx.save();


  ctx.strokeStyle =
    "#8e4d2a";


  ctx.lineWidth =
    2 * s;


  ctx.beginPath();


  ctx.moveTo(
    cx - 34 * s,
    cy + 22 * s
  );


  ctx.lineTo(
    cx - 22 * s,
    cy - 20 * s
  );


  ctx.lineTo(
    cx - 7 * s,
    cy - 2 * s
  );


  ctx.lineTo(
    cx + 4 * s,
    cy - 28 * s
  );


  ctx.lineTo(
    cx + 20 * s,
    cy - 5 * s
  );


  ctx.lineTo(
    cx + 34 * s,
    cy + 22 * s
  );


  ctx.closePath();


  ctx.stroke();


  ctx.beginPath();


  ctx.moveTo(
    cx - 28 * s,
    cy + 7 * s
  );


  ctx.lineTo(
    cx + 25 * s,
    cy + 7 * s
  );


  ctx.stroke();


  ctx.restore();

}


/* =========================================================
   项目图片
   ========================================================= */

function getProjectImageSrc(
  type
) {

  return type ===
    "fortress"

    ? "assets/fortress.jpg"

    : "assets/ruins.jpg";

}


/* =========================================================
   Canvas
   ========================================================= */

function compactProjectLabel(project) {
  return `${project.number}号${project.type === "fortress" ? "要塞" : "遗迹"}`;
}

function getTimeAllianceGroups(projects) {
  return TIMES.map(time => {
    const items = projects.filter(project => project.time === time);
    const alliances = [];

    items.forEach(project => {
      let group = alliances.find(item => item.alliance === project.alliance);
      if (!group) {
        group = { alliance: project.alliance, items: [] };
        alliances.push(group);
      }
      group.items.push(project);
    });

    return { time, alliances };
  }).filter(group => group.alliances.length);
}

async function drawCompactSchedule(canvas, projects) {
  const W = 444;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const groups = getTimeAllianceGroups(projects);
  const [fortressImg, ruinsImg] = await Promise.all([
    loadImage(getProjectImageSrc("fortress")),
    loadImage(getProjectImageSrc("ruins"))
  ]);
  const rewardImageMap = new Map();
  const rewardIds = [...new Set(projects.map(project => project.rewardId).filter(Boolean))];
  await Promise.all(rewardIds.map(async rewardId => {
    const image = await loadImage(rewardImagePath(rewardId));
    if (image) rewardImageMap.set(rewardId, image);
  }));
  const allianceFlagMap = new Map();
  await Promise.all(state.alliances.map(async alliance => {
     const flag = state.allianceDetails[alliance]?.flag || DEFAULT_ALLIANCE_FLAG;
     const image = await loadImage(flag);
     if (image) allianceFlagMap.set(alliance, image);
  }));
  const left = 4;
  const right = W - 4;
  const contentWidth = right - left;
  const headerH = 78;
  const timeHeaderH = 30;
  const rowPad = 7;
  const lineH = 36;
  const cardW = 108;
  const rows = [];

  const measureRows = group => {
    const result = [];
    group.alliances.forEach(allianceGroup => {
      const tokens = allianceGroup.items;
      const prefix = `${allianceGroup.alliance}  `;
      const lines = [[]];
      let lineWidth = 0;
      const available = right - (left + 82);

      tokens.forEach(project => {
        const tokenWidth = cardW + 2;
        if (lineWidth && lineWidth + tokenWidth > available) {
          lines.push([]);
          lineWidth = 0;
        }
        lines[lines.length - 1].push(project);
        lineWidth += tokenWidth;
      });

      result.push({ ...allianceGroup, prefix, lines });
    });
    return result;
  };

  groups.forEach(group => {
    const allianceRows = measureRows(group);
    rows.push({ ...group, allianceRows });
  });

  const H = headerH + rows.reduce(
    (total, group) => total + timeHeaderH + group.allianceRows.reduce(
      (height, row) => height + rowPad + row.lines.length * lineH,
      0
    ) + 12,
    0
  ) + 22;

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.display = "block";
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  canvas.style.maxWidth = "100%";

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#2c241e";
  ctx.font = "800 21px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  ctx.fillText("遗迹争夺战", left, 25);
  ctx.fillStyle = "#8d7d6d";
  ctx.font = "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  ctx.fillText("SANCTUARY BATTLE", left, 45);
  ctx.textAlign = "right";
  ctx.font = "600 10px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  ctx.fillText(state.date || todayFallback(), right, 38);
  ctx.fillStyle = "#e4d8cb";
  ctx.fillRect(left, 60, contentWidth, 1);

  let y = headerH;
  rows.forEach(group => {
    ctx.fillStyle = "#c8753c";
    ctx.beginPath();
    ctx.arc(left + 4, y + 11, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#2c241e";
    ctx.font = "800 15px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
    ctx.fillText(group.time, left + 14, y + 11);
    y += timeHeaderH;

    group.allianceRows.forEach(row => {
      row.lines.forEach((line, lineIndex) => {
        const rowY = y + rowPad + lineIndex * lineH;
        if (lineIndex === 0) {
          ctx.fillStyle = "#e8c7ad";
          roundedRect(ctx, left + 4, rowY - 5, 58, 30, 5);
          ctx.fill();
          const detail = state.allianceDetails[row.alliance] || {};
          const flag = allianceFlagMap.get(row.alliance);
          if (flag) {
            ctx.save();
            roundedRect(ctx, left + 7, rowY - 2, 16, 16, 3);
            ctx.clip();
            const scale = Math.max(16 / flag.width, 16 / flag.height);
            const dw = flag.width * scale;
            const dh = flag.height * scale;
            ctx.drawImage(flag, left + 7 + (16 - dw) / 2, rowY - 2 + (16 - dh) / 2, dw, dh);
            ctx.restore();
          }
          ctx.textAlign = flag ? "left" : "center";
          ctx.fillStyle = "#73330e";
          ctx.font = "800 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
          ctx.fillText(row.alliance, flag ? left + 26 : left + 33, rowY + 5);
          if (detail.fullName) {
            ctx.fillStyle = "#8d7d6d";
            ctx.font = "600 6px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
            ctx.textAlign = "right";
            drawEllipsisText(ctx, detail.fullName, left + 58, rowY + 19, flag ? 30 : 48);
          }
        }
        line.forEach((project, projectIndex) => {
          const cardX = left + 82 + projectIndex * (cardW + 2);
          const cardY = rowY - 5;
          const image = project.type === "fortress" ? fortressImg : ruinsImg;

          ctx.fillStyle = project.type === "fortress" ? "#f0dfd1" : "#eee8df";
          roundedRect(ctx, cardX, cardY, cardW, 30, 5);
          ctx.fill();

          ctx.save();
          roundedRect(ctx, cardX + 3, cardY + 3, 24, 24, 3);
          ctx.clip();
          if (image) {
            const scale = Math.max(24 / image.width, 24 / image.height);
            const dw = image.width * scale;
            const dh = image.height * scale;
            ctx.drawImage(image, cardX + 3 + (24 - dw) / 2, cardY + 3 + (24 - dh) / 2, dw, dh);
          }
          ctx.restore();

          ctx.textAlign = "left";
          ctx.fillStyle = "#5c4f43";
          ctx.font = "800 9px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
          ctx.fillText(`${project.number}号`, cardX + 32, cardY + 12);
          ctx.font = "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
          ctx.fillStyle = "#8d7d6d";
          ctx.fillText(project.type === "fortress" ? "要塞" : "遗迹", cardX + 32, cardY + 23);

          const reward = getRewardById(project.rewardId, state.rewardGeneration);
          const rewardImage = rewardImageMap.get(project.rewardId);
          if (reward) {
            const rewardX = cardX + cardW - 19;
            if (rewardImage) {
              ctx.save();
              roundedRect(ctx, rewardX, cardY + 2, 16, 16, 3);
              ctx.clip();
              const rewardScale = Math.max(16 / rewardImage.width, 16 / rewardImage.height);
              const rewardW = rewardImage.width * rewardScale;
              const rewardH = rewardImage.height * rewardScale;
              ctx.drawImage(rewardImage, rewardX + (16 - rewardW) / 2, cardY + 2 + (16 - rewardH) / 2, rewardW, rewardH);
              ctx.restore();
            }
            ctx.fillStyle = "#8d7d6d";
            ctx.font = "600 7px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
            ctx.textAlign = "right";
            drawEllipsisText(ctx, getRewardDisplayName(reward), cardX + cardW - 4, cardY + 25, cardW - 56);
          }
        });
      });
      y += rowPad + row.lines.length * lineH;
    });
    y += 12;
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "#b2a49a";
  ctx.font = "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  ctx.fillText("Battle Schedule", W / 2, H - 10);
}

async function drawUserFirstSchedule(canvas, projects, version) {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const groups = getTimeAllianceGroups(projects);
  const singleAlliance = new Set(projects.map(project => project.alliance)).size === 1;
  const maxProjectCount = Math.max(
    1,
    ...groups.flatMap(group => group.alliances.map(alliance => alliance.items.length))
  );
  const projectCols = maxProjectCount >= 4
    ? 2
    : Math.min(3, Math.max(2, maxProjectCount));
  // Keep a two-column canvas even when a row has only one project; the
  // second slot is rendered as the dashed empty placeholder below.
  const projectCardW = 96;
  const cardGap = 3;
  const left = 4;
  const W = left + 90 + projectCols * projectCardW + (projectCols - 1) * cardGap + 4;
  const right = W - 4;
  const width = right - left;
  const headerH = 72;
  const timeH = 28;
  const projectCellH = 47;
  const getAllianceHeight = alliance => 4 + Math.ceil(alliance.items.length / projectCols) * projectCellH;
  const logo = await loadImage("assets/logo.png");
  const fortressImg = await loadImage(getProjectImageSrc("fortress"));
  const ruinsImg = await loadImage(getProjectImageSrc("ruins"));
  const rewardImageMap = new Map();
  const rewardIds = [...new Set(projects.map(project => project.rewardId).filter(Boolean))];
  await Promise.all(rewardIds.map(async rewardId => {
    const image = await loadImage(rewardImagePath(rewardId));
    if (image) rewardImageMap.set(rewardId, image);
  }));
  const allianceFlagMap = new Map();
  await Promise.all(state.alliances.map(async alliance => {
     const flag = state.allianceDetails[alliance]?.flag || DEFAULT_ALLIANCE_FLAG;
     const image = await loadImage(flag);
     if (image) allianceFlagMap.set(alliance, image);
  }));
  if (version !== renderVersion) return;

  const footerSpace = state.showFooterMessage && state.footerMessage ? 22 : 8;
  const H = headerH + groups.reduce((total, group) => (
    total + timeH + group.alliances.reduce((height, alliance) => height + getAllianceHeight(alliance), 0) + 10
  ), 0) + footerSpace;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.display = "block";
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  canvas.style.maxWidth = "100%";

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#fffdfb";
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "middle";

  if (logo) {
    ctx.save();
    const size=48;
    roundedRect(ctx, left, 10, size, size, 6);
    ctx.clip();
    const logoScale = Math.max(size / logo.width, size / logo.height);
    const logoW = logo.width * logoScale;
    const logoH = logo.height * logoScale;
    ctx.drawImage(logo, left + (size - logoW) / 2-2, 8 + (size - logoH) / 2, logoW, logoH);
    ctx.restore();
  }

  const titleX = left + 42;
  const dateText = state.date || todayFallback();
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  const dateWidth = ctx.measureText(dateText).width;
  const titleMaxWidth = Math.max(96, right - titleX - dateWidth - 14);

  ctx.textAlign = "left";
  ctx.fillStyle = "#4a2a1a";
  ctx.font = "800 19px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  drawLeftEllipsisText(ctx, state.title || "遗迹・要塞作战安排", titleX, 23, titleMaxWidth);
  ctx.fillStyle = "#8c614e";
  ctx.font = "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  drawLeftEllipsisText(ctx, state.subtitle || "", titleX, 43, titleMaxWidth);
  ctx.textAlign = "right";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
  ctx.fillText(dateText, right, 23);
  ctx.fillStyle = "#f0d8c5";
  ctx.fillRect(left, 57, width, 1);

  let y = headerH;
  groups.forEach(group => {
    ctx.textAlign = "left";
    ctx.fillStyle = "#df6f3f";
    ctx.beginPath();
    ctx.arc(left + 4, y + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a2a1a";
    ctx.font = "800 14px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
    ctx.fillText(group.time, left + 14, y + 10);
    y += timeH;

    group.alliances.forEach(allianceGroup => {
      const rowY = y;
      const detail = state.allianceDetails[allianceGroup.alliance] || {};
      const flag = allianceFlagMap.get(allianceGroup.alliance);
      ctx.fillStyle = "#fffaf6";
      const allianceH = getAllianceHeight(allianceGroup);
      roundedRect(ctx, left, rowY, width, allianceH - 2, 7);
      ctx.fill();

      const allianceBoxX = left + 4;
      const allianceBoxY = rowY + 2;
      const allianceBoxW = 84;
      const allianceBoxH = singleAlliance ? Math.min(allianceH - 4, 56) : allianceH - 4;
      ctx.fillStyle = "#ffe6d4";
      roundedRect(ctx, allianceBoxX, allianceBoxY, allianceBoxW, allianceBoxH, 5);
      ctx.fill();

      if (flag) {
        ctx.save();
        roundedRect(ctx, allianceBoxX + 3, allianceBoxY + 3, 40, 40, 4);
        ctx.clip();
        const scale = Math.max(28 / flag.width, 28 / flag.height);
        const dw = flag.width * scale;
        const dh = flag.height * scale;
        ctx.drawImage(flag, allianceBoxX + 3 + (40 - dw) / 2, allianceBoxY + 3 + (40 - dh) / 2, dw, dh);
        ctx.restore();
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "#a84d2d";
      ctx.font = "800 10px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
      const abbreviationX = allianceBoxX + (flag ? 44 : 25);
      const abbreviationWidth = 34;
      const abbreviationY = allianceBoxY + 10;
      ctx.fillStyle = "#fff7f0";
      roundedRect(ctx, abbreviationX - 2, abbreviationY, abbreviationWidth, 16, 5);
      ctx.fill();
      ctx.strokeStyle = "#e3a17f";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#c56843";
      ctx.fillText(allianceGroup.alliance, abbreviationX - 2 + abbreviationWidth / 2, abbreviationY + 8);
      if (detail.fullName) {
        ctx.fillStyle = "#8c614e";
        ctx.font = "600 5px 'Noto Sans SC', sans-serif";
        ctx.textAlign = "center";
        drawEllipsisText(ctx, detail.fullName, allianceBoxX + allianceBoxW / 2 + (flag ? 18 : 0), allianceBoxY + 24+8, allianceBoxW - 8);
      }

      const projectSlotCount = Math.ceil(allianceGroup.items.length / projectCols) * projectCols;
      Array.from({ length: projectSlotCount }, (_, projectIndex) => allianceGroup.items[projectIndex]).forEach((project, projectIndex) => {
        const col = projectIndex % projectCols;
        const row = Math.floor(projectIndex / projectCols);
        const cellW = (width - 90 - cardGap * (projectCols - 1)) / projectCols;
        const cellX = left + 90 + col * (cellW + cardGap);
        const cellY = rowY + 2 + row * projectCellH;
        const image = project ? (project.type === "fortress" ? fortressImg : ruinsImg) : null;

        ctx.fillStyle = project
          ? (project.type === "fortress" ? "#ffe0cc" : "#fff1c9")
          : "#fffaf6";
        roundedRect(ctx, cellX, cellY, cellW, 44, 5);
        ctx.fill();
        ctx.strokeStyle = project
          ? (project.type === "fortress" ? "#edb58f" : "#e8ca82")
          : "#f0d8c5";
        ctx.lineWidth = 0.7;
        ctx.setLineDash(project ? [] : [3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (image) {
          ctx.save();
          roundedRect(ctx, cellX + 3, cellY + 3, 38, 38, 4);
          ctx.clip();
          const scale = Math.max(38 / image.width, 38 / image.height);
          const dw = image.width * scale;
          const dh = image.height * scale;
          ctx.drawImage(image, cellX + 3 + (38 - dw) / 2, cellY + 3 + (38 - dh) / 2, dw, dh);
          ctx.restore();
        }

        if (project) {
          ctx.textAlign = "left";
          ctx.fillStyle = "#5b3828";
          ctx.font = "800 8px 'Noto Sans SC', sans-serif";
          ctx.textAlign = "right";
          drawEllipsisText(ctx, compactProjectLabel(project), cellX + cellW - 10, cellY + 16, cellW - 50);
        }

        const reward = project ? getRewardById(project.rewardId, state.rewardGeneration) : null;
        const rewardImage = project ? rewardImageMap.get(project.rewardId) : null;
        if (reward) {
          const rewardName = getRewardDisplayName(reward);
          ctx.font = "800 7px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
          const rewardTextWidth = Math.min(35, ctx.measureText(rewardName).width);
          const rewardContentWidth = 10 + 3 + rewardTextWidth;
          const rewardStartX = cellX + 44 + Math.max(0, (cellW - 54 - rewardContentWidth) / 2);
          if (rewardImage) ctx.drawImage(rewardImage, rewardStartX, cellY + 26, 12, 12);
      ctx.fillStyle = "#8c614e";
          ctx.textAlign = "right";
          drawEllipsisText(ctx, rewardName, rewardStartX + rewardContentWidth, cellY + 32, rewardTextWidth);
        }
      });
      y += allianceH;
    });
    y += 10;
  });

  if (state.showFooterMessage && state.footerMessage) {
    ctx.textAlign = "center";
    ctx.font = "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";
    const footerW = Math.min(W - 24, Math.max(150, ctx.measureText(state.footerMessage).width + 34));
    const footerX = (W - footerW) / 2;
    const footerY = H - 27;
    ctx.fillStyle = "#fff0e6";
    roundedRect(ctx, footerX, footerY, footerW, 19, 9);
    ctx.fill();
    ctx.strokeStyle = "#f1c3a6";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = "#df6f3f";
    ctx.beginPath();
    ctx.arc(footerX + 10, footerY + 9.5, 2, 0, Math.PI * 2);
    ctx.arc(footerX + footerW - 10, footerY + 9.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a84d2d";
    ctx.fillText(state.footerMessage, W / 2, footerY + 10);
  }
}

async function drawSchedule() {

  /*
   * 等待浏览器完成当前 DOM 布局。
   *
   * renderProjects() / renderRewardAssignments()
   * 修改 DOM 后，不立即进行 Canvas 绘制。
   */
  await new Promise(
    resolve =>
      requestAnimationFrame(
        resolve
      )
  );


  const canvas =
    $("#scheduleCanvas");


  if (!canvas) {

    return;

  }


  /*
   * 每次绘制产生新的版本。
   */
  const currentVersion =
    ++renderVersion;


  const projects =
    getSortedProjects();


  lastSorted =
    projects;

  if (projects.length) {
    await drawUserFirstSchedule(canvas, projects, currentVersion);
    return;
  }


  /*
   * 没有项目：
   *
   * 不再设置 canvas.width = 0。
   * 直接隐藏 Canvas。
   */
  if (!projects.length) {

    canvas.style.display =
      "none";


    canvas.width =
      1;


    canvas.height =
      1;


    return;

  }


  /*
   * 有项目时恢复显示。
   */
  canvas.style.display =
    "block";


  const W =
    360;


  /*
   * 高清 DPR。
   */
  const dpr =
    Math.max(
      1,
      Math.min(
        window.devicePixelRatio ||
          1,
        2
      )
    );


  const size =
    48;


  const rowH =
    68;


  const timeHeaderH =
    42;


  const groupGap =
    15;


  const headerH =
    88;


  const bottomH =
    24;


  const groups =
    [];


  TIMES.forEach(
    time => {

      const items =
        projects.filter(
          project =>
            project.time ===
            time
        );


      if (items.length) {

        groups.push({
          time,
          items
        });

      }

    }
  );


  let H =
    headerH;


  groups.forEach(
    group => {

      H +=
        timeHeaderH;


      H +=
        group.items.length *
        rowH;


      H +=
        groupGap;

    }
  );


  H +=
    bottomH;


  /*
   * -------------------------------------------------------
   * Canvas 尺寸
   * -------------------------------------------------------
   *
   * width / height：
   * Canvas 实际像素。
   *
   * style.width：
   * 页面 CSS 显示尺寸。
   */
  const pixelWidth =
    Math.round(
      W * dpr
    );


  const pixelHeight =
    Math.round(
      H * dpr
    );


  canvas.width =
    pixelWidth;


  canvas.height =
    pixelHeight;


  canvas.style.display =
    "block";


  canvas.style.width =
    `${W}px`;


  canvas.style.height =
    `${H}px`;


  canvas.style.maxWidth =
    "100%";


  /*
   * 获取 Context。
   */
  const ctx =
    canvas.getContext(
      "2d",
      {
        alpha:
          false
      }
    );


  if (!ctx) {

    console.warn(
      "无法获取 Canvas 2D Context。"
    );


    return;

  }


  /*
   * 清除旧画面。
   */
  ctx.setTransform(
    1,
    0,
    0,
    1,
    0,
    0
  );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
   * 使用 DPR 进行高清绘制。
   */
  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );


  /*
   * 背景。
   */
  ctx.fillStyle =
    "#faf7f2";


  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  const left =
    12;


  const right =
    W - 12;


  const timelineX =
    16;


  const itemX =
    27;


  /* =======================================================
     标题
     ======================================================= */

  ctx.fillStyle =
    "#2c241e";


  ctx.textAlign =
    "left";


  ctx.textBaseline =
    "middle";


  ctx.font =
    "800 20px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


  ctx.fillText(
    "遗迹争夺战",
    left,
    26
  );


  ctx.fillStyle =
    "#8d7d6d";


  ctx.font =
    "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


  ctx.fillText(
    "SANCTUARY BATTLE",
    left,
    45
  );


  const generation =
    getGenerationById(
      state.rewardGeneration
    );


  ctx.textAlign =
    "right";


  ctx.fillStyle =
    "#8d7d6d";


  ctx.font =
    "700 9px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


  // if (generation) {

  //   ctx.fillText(
  //     generation.name,
  //     right,
  //     25
  //   );

  // }


  ctx.font =
    "600 9px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


  ctx.fillText(
    state.date ||
      todayFallback(),
    right,
    42
  );


  ctx.fillStyle =
    "#e4d8cb";


  ctx.fillRect(
    left,
    62,
    W - left * 2,
    1
  );


  /* =======================================================
     图片预加载
     ======================================================= */

  const fortressImagePromise =
    loadImage(
      getProjectImageSrc(
        "fortress"
      )
    );


  const ruinsImagePromise =
    loadImage(
      getProjectImageSrc(
        "ruins"
      )
    );


  /*
   * 当前实际使用的奖励。
   */
  const usedRewardIds =
    [
      ...new Set(
        projects
          .map(
            project =>
              project.rewardId
          )
          .filter(
            Boolean
          )
      )
    ];


  /*
   * 同时加载要塞和遗迹图片。
   */
  const [
    fortressImg,
    ruinsImg
  ] =
    await Promise.all([
      fortressImagePromise,
      ruinsImagePromise
    ]);


  /*
   * 如果期间发生了新的渲染，
   * 当前绘制直接放弃。
   */
  if (
    currentVersion !==
    renderVersion
  ) {

    return;

  }


  /*
   * 奖励图片。
   */
  const rewardImageMap =
    new Map();


  const rewardImages =
    await Promise.all(
      usedRewardIds.map(
        async rewardId => {

          const reward =
            getRewardById(
              rewardId,
              state.rewardGeneration
            );


          if (!reward) {

            return null;

          }


          const image =
            await loadImage(
              rewardImagePath(
                reward.id
              )
            );


          return {

            id:
              reward.id,

            image

          };

        }
      )
    );


  /*
   * 再次检查版本。
   */
  if (
    currentVersion !==
    renderVersion
  ) {

    return;

  }


  rewardImages.forEach(
    item => {

      if (
        item &&
        item.image
      ) {

        rewardImageMap.set(
          item.id,
          item.image
        );

      }

    }
  );


  /*
   * 确保 Canvas 仍然在 DOM 中。
   */
  if (
    !canvas.isConnected
  ) {

    return;

  }


  canvas.style.display =
    "block";


  /* =======================================================
     时间组
     ======================================================= */

  let y =
    headerH;


  for (
    const group
    of groups
  ) {

    /*
     * 时间圆点
     */
    ctx.fillStyle =
      "#c8753c";


    ctx.beginPath();


    ctx.arc(
      timelineX,
      y + 12,
      3.5,
      0,
      Math.PI * 2
    );


    ctx.fill();


    /*
     * 时间
     */
    ctx.fillStyle =
      "#2c241e";


    ctx.textAlign =
      "left";


    ctx.font =
      "800 15px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


    ctx.fillText(
      group.time,
      timelineX + 8,
      y + 12
    );


    /*
     * 12:00 提示
     */
    if (
      group.time ===
      "12:00"
    ) {

      ctx.fillStyle =
        "#8d7d6d";


      ctx.font =
        "800 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


      ctx.fillText(
        "拿完联盟争霸赛奖励后再切盟",
        timelineX + 58,
        y + 12
      );

    }


    y +=
      timeHeaderH;


    const groupTop =
      y;


    const groupBottom =
      y +
      group.items.length *
        rowH -
      6;


    /*
     * 时间线
     */
    ctx.strokeStyle =
      "#e4d8cb";


    ctx.lineWidth =
      1;


    ctx.beginPath();


    ctx.moveTo(
      timelineX,
      groupTop - 8
    );


    ctx.lineTo(
      timelineX,
      groupBottom
    );


    ctx.stroke();


    /*
     * 项目
     */
    for (
      let i = 0;
      i <
      group.items.length;
      i++
    ) {

      const project =
        group.items[i];


      const rowY =
        y +
        i * rowH;


      const iy =
        rowY +
        (rowH - size) /
          2;


      /* ---------------------------------------------------
         项目图片
         --------------------------------------------------- */

      const img =
        project.type ===
          "fortress"
          ? fortressImg
          : ruinsImg;


      ctx.save();


      roundedRect(
        ctx,
        itemX,
        iy,
        size,
        size,
        4
      );


      ctx.clip();


      if (img) {

        const scale =
          Math.max(
            size /
              img.width,
            size /
              img.height
          );


        const dw =
          img.width *
          scale;


        const dh =
          img.height *
          scale;


        ctx.drawImage(
          img,
          itemX +
            (size - dw) /
              2,
          iy +
            (size - dh) /
              2,
          dw,
          dh
        );

      } else {

        ctx.fillStyle =
          project.type ===
          "fortress"

            ? "#e0cdbc"

            : "#e6ded3";


        ctx.fill();


        if (
          project.type ===
          "fortress"
        ) {

          drawCastleIcon(
            ctx,
            itemX +
              size / 2,
            iy +
              size / 2,
            size / 70
          );

        } else {

          drawRuinIcon(
            ctx,
            itemX +
              size / 2,
            iy +
              size / 2,
            size / 70
          );

        }

      }


      ctx.restore();


      /* ---------------------------------------------------
         左侧文字
         --------------------------------------------------- */

      const contentX =
        itemX +
        size +
        8;


      /*
       * 联盟
       */
      ctx.font =
        "700 13px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


      const badgeW =
        ctx.measureText(
          project.alliance
        ).width +
        12;


      ctx.fillStyle =
        "#e8c7ad";


      roundedRect(
        ctx,
        contentX,
        rowY + 5,
        badgeW,
        18,
        3
      );


      ctx.fill();


      ctx.fillStyle =
        "#73330e";


      ctx.textAlign =
        "center";


      ctx.fillText(
        project.alliance,
        contentX +
          badgeW / 2,
        rowY + 14.5
      );


      /*
       * 项目名称
       */
      ctx.textAlign =
        "left";


      ctx.fillStyle =
        "#5c4f43";


      ctx.font =
        "700 11px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


      ctx.fillText(
        project.name,
        contentX,
        rowY + 32
      );


      /* ---------------------------------------------------
         奖励
         --------------------------------------------------- */

      const reward =
        getRewardById(
          project.rewardId,
          state.rewardGeneration
        );


      if (reward) {

        const rewardSize =
          size * 0.8;


        const rightImgX =
          W -
          12 -
          rewardSize;


        const rewardImg =
          rewardImageMap.get(
            reward.id
          );


        /*
         * 奖励图片
         */
        if (rewardImg) {

          ctx.save();


          roundedRect(
            ctx,
            rightImgX,
            iy,
            rewardSize,
            rewardSize,
            4
          );


          ctx.clip();


          const scale =
            Math.max(
              rewardSize /
                rewardImg.width,
              rewardSize /
                rewardImg.height
            );


          const dw =
            rewardImg.width *
            scale;


          const dh =
            rewardImg.height *
            scale;


          ctx.drawImage(
            rewardImg,
            rightImgX +
              (rewardSize - dw) /
                2,
            iy +
              (rewardSize - dh) /
                2,
            dw,
            dh
          );


          ctx.restore();

        }


        /*
         * 奖励名称
         */
        ctx.textAlign =
          "right";


        ctx.fillStyle =
          "#2c241e";


        ctx.font =
          "700 10px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


        const rewardTextRight =
          rightImgX -
          7;


        const maxRewardWidth =
          Math.max(
            35,
            rewardTextRight -
              contentX -
              4
          );


        drawEllipsisText(
          ctx,
          reward.name,
          rewardTextRight,
          rowY-(rewardSize - dh) /
                2 +
            rowH / 2,
          maxRewardWidth
        );

      }


      /*
       * 项目分隔线
       */
      if (
        i <
        group.items.length - 1
      ) {

        ctx.strokeStyle =
          "#e4d8cb";


        ctx.lineWidth =
          1;


        ctx.beginPath();


        ctx.moveTo(
          contentX,
          rowY +
            rowH -
            1
        );


        ctx.lineTo(
          right,
          rowY +
            rowH -
            1
        );


        ctx.stroke();

      }

    }


    y +=
      group.items.length *
      rowH;


    y +=
      groupGap;

  }


  /* =======================================================
     底部
     ======================================================= */

  ctx.textAlign =
    "center";


  ctx.textBaseline =
    "middle";


  ctx.fillStyle =
    "#b2a49a";


  ctx.font =
    "700 8px -apple-system, BlinkMacSystemFont, 'Noto Sans SC', sans-serif";


  ctx.fillText(
    "Battle Schedule",
    W / 2,
    H - 10
  );


  /*
   * 最终显示保护。
   */
  if (
    canvas.isConnected &&
    canvas.width > 1 &&
    canvas.height > 1
  ) {

    canvas.style.display =
      "block";

    canvas.style.maxWidth =
      "100%";

  }

}


/* =========================================================
   文字输出
   ========================================================= */

function generateText() {

  const groups = getTimeAllianceGroups(getSortedProjects());
  const groupedLines = [state.title || "遗迹・要塞作战安排"];
  if (state.subtitle) groupedLines.push(state.subtitle);
  groupedLines.push("");

  groups.forEach(group => {
    groupedLines.push(group.time);
    group.alliances.forEach(allianceGroup => {
      groupedLines.push(
        `${allianceGroup.alliance}  ${allianceGroup.items
          .map(compactProjectLabel)
          .join("  ")}`
      );
    });
    groupedLines.push("");
  });

  if (state.showFooterMessage && state.footerMessage) {
    groupedLines.push(state.footerMessage);
  }

  return groupedLines.join("\n").trim();

}

/* =========================================================
   Canvas 显示保护
   ========================================================= */

function ensureCanvasPreview() {

  const canvas =
    $("#scheduleCanvas");


  if (!canvas) {

    return;

  }


  if (
    canvas.width > 1 &&
    canvas.height > 1
  ) {

    canvas.style.display =
      "block";


    canvas.style.maxWidth =
      "100%";


    /*
     * 不强制覆盖高度。
     * Canvas 自己保持绘制比例。
     */
    if (
      !canvas.style.height
    ) {

      canvas.style.height =
        "auto";

    }

  }

}


/* =========================================================
   输出更新
   ========================================================= */

async function updateOutput() {

  const projects =
    getSortedProjects();


  lastSorted =
    projects;


  /*
   * 项目数量
   */
  const count =
    $("#projectCount");


  if (count) {

    count.textContent =
      `${projects.length} 项已安排`;

  }


  /*
   * 空状态
   */
  const empty =
    $("#previewEmpty");


  if (empty) {

    empty.style.display =
      projects.length
        ? "none"
        : "";

  }


  /*
   * 文字输出
   */
  const textarea =
    $("#textOutput");


  if (textarea) {

    textarea.value =
      generateText();

  }


  /*
   * 下载按钮
   */
  const downloadBtn =
    $("#downloadBtn");


  if (downloadBtn) {

    downloadBtn.disabled =
      !projects.length;

  }


  /*
   * 复制按钮
   */
  const copyBtn =
    $("#copyBtn");


  if (copyBtn) {

    copyBtn.disabled =
      !projects.length;

  }


  /*
   * 没有项目。
   */
  if (!projects.length) {

    const canvas =
      $("#scheduleCanvas");


    if (canvas) {

      canvas.style.display =
        "none";


      canvas.width =
        1;


      canvas.height =
        1;

    }


    return;

  }


  /*
   * 等待 DOM 更新。
   */
  await new Promise(
    resolve =>
      requestAnimationFrame(
        resolve
      )
  );


  /*
   * 绘制 Canvas。
   */
  await drawSchedule();


  /*
   * 最后再确保 Canvas 可见。
   */
  ensureCanvasPreview();

}


/* =========================================================
   生成长图
   ========================================================= */

/* =========================================================
   一键复制
   ========================================================= */

const copyBtn =
  $("#copyBtn");


if (copyBtn) {

  copyBtn.addEventListener(
    "click",
    async () => {

      const textarea =
        $("#textOutput");


      if (!textarea) {

        return;

      }


      const text =
        textarea.value;


      if (!text) {

        return;

      }


      try {

        await navigator
          .clipboard
          .writeText(
            text
          );


        const old =
          copyBtn.textContent;


        copyBtn.textContent =
          "已复制 ✓";


        setTimeout(
          () => {

            copyBtn.textContent =
              old;

          },
          1400
        );

      } catch {

        textarea.select();


        document.execCommand(
          "copy"
        );


        showToast("已复制。", "success");

      }

    }
  );

}


/* =========================================================
   下载 PNG
   ========================================================= */

const downloadBtn =
  $("#downloadBtn");


if (downloadBtn) {

  downloadBtn.addEventListener(
    "click",
    () => {

      const canvas =
        $("#scheduleCanvas");


      if (
        !canvas ||
        !canvas.width ||
        !canvas.height
      ) {

        return;

      }


      try {
        const fileName = `${state.date || "schedule"}.png`;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        if (isIOS) {
          const dataUrl = canvas.toDataURL("image/png");
          let preview = document.querySelector(".image-preview-modal");
          if (!preview) {
            preview = document.createElement("div");
            preview.className = "image-preview-modal";
            preview.innerHTML = `
              <div class="image-preview-dialog" role="dialog" aria-modal="true" aria-label="PNG 预览">
                <button type="button" class="image-preview-close" aria-label="关闭图片预览">关闭</button>
                <img alt="作战安排 PNG 预览" />
                <p>长按图片保存到照片或文件</p>
              </div>`;
            preview.addEventListener("click", event => {
              if (event.target === preview || event.target.closest(".image-preview-close")) {
                preview.classList.remove("is-visible");
              }
            });
            document.body.appendChild(preview);
          }
          preview.querySelector("img").src = dataUrl;
          preview.classList.add("is-visible");
          showToast("图片已生成，请长按图片保存。", "success");
          return;
        }

        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.warn("PNG 导出失败。", error);
        showToast("PNG 导出失败，请稍后重试。", "warning");
      }

    }
  );

}


/* =========================================================
   日期
   ========================================================= */

const battleDate =
  $("#battleDate");


if (battleDate) {

  battleDate.addEventListener(
    "change",
    event => {

      state.date =
        event.target.value;


      saveState();


      updateOutput();

    }
  );

}

const titleText = $("#titleText");
const subtitleText = $("#subtitleText");
const footerText = $("#footerText");
const showFooterText = $("#showFooterText");

function bindCopySetting(input, key) {
  if (!input) return;
  input.addEventListener("input", event => {
    state[key] = event.target.value;
    saveState();
    updateOutput();
  });
}

bindCopySetting(titleText, "title");
bindCopySetting(subtitleText, "subtitle");
bindCopySetting(footerText, "footerMessage");

if (showFooterText) {
  showFooterText.addEventListener("change", event => {
    state.showFooterMessage = event.target.checked;
    saveState();
    updateOutput();
  });
}


/* =========================================================
   折叠面板
   ========================================================= */

const COLLAPSE_STORAGE_KEY =
  "battle-schedule-panels-v1";


function loadCollapseState() {

  try {

    const raw =
      localStorage.getItem(
        COLLAPSE_STORAGE_KEY
      );


    if (!raw) {

      return {};

    }


    const parsed =
      JSON.parse(
        raw
      );


    return (
      parsed &&
      typeof parsed ===
        "object"
        ? parsed
        : {}
    );

  } catch {

    return {};

  }

}


function saveCollapseState(
  collapseState
) {

  try {

    localStorage.setItem(
      COLLAPSE_STORAGE_KEY,
      JSON.stringify(
        collapseState
      )
    );

  } catch (error) {

    console.warn(
      "保存折叠状态失败：",
      error
    );

  }

}





/* =========================================================
   总渲染
   ========================================================= */

function renderAll() {

  /*
   * 奖励动态样式
   */
  injectRewardStyles();


  /*
   * 日期
   */
  const dateInput =
    $("#battleDate");


  if (dateInput) {

    dateInput.value =
      state.date ||
      todayFallback();

  }

  const titleInput = $("#titleText");
  const subtitleInput = $("#subtitleText");
  const footerInput = $("#footerText");
  const footerToggle = $("#showFooterText");
  if (titleInput) titleInput.value = state.title || "";
  if (subtitleInput) subtitleInput.value = state.subtitle || "";
  if (footerInput) footerInput.value = state.footerMessage || "";
  if (footerToggle) footerToggle.checked = state.showFooterMessage !== false;


  /*
   * 联盟
   */
  renderAlliances();

  renderTimeAlliancePriority();


  /*
   * 奖励版本
   */
  renderGenerationOptions();


  /*
   * 项目
   */
  renderProjects();

  updateProjectArrangementSummary();


  /*
   * 批量工具
   */
  renderBulk();


  /*
   * 折叠面板
   *
   * 必须在所有动态内容完成后执行。
   */
  /*
   * 输出。
   */
  updateOutput();

}


/* =========================================================
   初始化
   ========================================================= */

function setupEditorModals() {
  const openers = {
    allianceSettingsBtn: "allianceSettings",
    projectSettingsBtn: "projectSettings",
    textToggle: "textOutput"
  };

  let activeOpener = null;

  const closeAll = ({ restoreFocus = true } = {}) => {
    document.querySelectorAll(".modal-panel.is-open").forEach(panel => {
      panel.classList.remove("is-open");
    });
    document.body.classList.remove("modal-open");
    modalEditSnapshot = null;
    if (restoreFocus) {
      activeOpener?.focus({ preventScroll: true });
    }
    activeOpener = null;
  };

  const hasEditorChanges = () => (
    modalEditSnapshot !== null &&
    JSON.stringify(state) !== modalEditSnapshot
  );

  window.addEventListener("beforeunload", event => {
    const openEditor = document.querySelector('.modal-panel.is-open[data-modal-mode="editor"]');
    if (!openEditor || !hasEditorChanges()) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const focusableSelector = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])"
  ].join(",");

  const keepFocusInside = (panel, event) => {
    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll(focusableSelector)].filter(item => {
      return item.getClientRects().length > 0;
    });
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  Object.entries(openers).forEach(([buttonId, modalName]) => {
    const button = document.getElementById(buttonId);
    const panel = document.querySelector(`[data-modal="${modalName}"]`);
    if (!button || !panel || button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", event => {
      event.stopPropagation();
      activeOpener = button;
      const isEditor = panel.dataset.modalMode === "editor";
      if (isEditor) {
        modalEditSnapshot = JSON.stringify(state);
      }
      document.querySelectorAll(".modal-panel.is-open").forEach(item => {
        item.classList.remove("is-open");
      });
      panel.classList.add("is-open");
      document.body.classList.add("modal-open");
      requestAnimationFrame(() => {
        const firstFocusable = panel.querySelector(focusableSelector);
        firstFocusable?.focus({ preventScroll: true });
      });
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(button => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", closeAll);
  });

  if (!document.body.dataset.modalOutsideBound) {
    document.body.dataset.modalOutsideBound = "true";
    document.addEventListener("click", event => {
      const openPanel = document.querySelector(".modal-panel.is-open");
      if (!openPanel) return;
      if (openPanel.contains(event.target)) return;
      if (event.target.closest("#allianceSettingsBtn, #projectSettingsBtn, #textToggle")) return;
      if (event.target.closest(".project-reward")) return;

      const isEditor = openPanel.dataset.modalMode === "editor";
      if (isEditor && hasEditorChanges() && !confirm("是否放弃本次编辑并关闭？")) return;
      if (isEditor && hasEditorChanges()) {
        state = normalizeState(JSON.parse(modalEditSnapshot));
        saveState();
      }
      closeAll();
      renderAll();
    });
  }

  if (!document.body.dataset.modalEscapeBound) {
    document.body.dataset.modalEscapeBound = "true";
    document.addEventListener("keydown", event => {
      const openPanel = document.querySelector(".modal-panel.is-open");
      if (!openPanel) return;
      if (event.key === "Escape") {
        if (openPanel.dataset.modalMode === "editor" && hasEditorChanges() && !confirm("是否放弃本次编辑并关闭？")) return;
        if (openPanel.dataset.modalMode === "editor" && hasEditorChanges()) {
          state = normalizeState(JSON.parse(modalEditSnapshot));
          saveState();
        }
        closeAll();
        renderAll();
        return;
      }
      keepFocusInside(openPanel, event);
    });
  }
}

setupEditorModals();
renderAll();
