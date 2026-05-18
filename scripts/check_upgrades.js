// Clash of Clans 升级检查脚本
// 由 GitHub Actions 定时运行，检测升级完成并通过 ntfy.sh/Bark 推送通知

const fs = require('fs');
const path = require('path');

// ========== 配置 ==========
const GAME_DATA_PATH = path.join(__dirname, '..', 'game_data.json');
const NOTIFIED_PATH = path.join(__dirname, '..', 'notified_items.json');
const PROVIDER = process.env.NOTIFY_PROVIDER || 'ntfy';
const NTFY_TOPIC = process.env.NTFY_TOPIC || '';
const NTFY_SERVER = process.env.NTFY_SERVER || 'https://ntfy.sh';
const BARK_KEY = process.env.BARK_KEY || '';

// ========== 项目名称映射表 ==========
const ITEM_NAMES = {
    "124000000": "工人助手", "93000000": "工人助手",
    "124000001": "实验室助手", "93000001": "实验室助手",
    "124000002": "炼金术师", "93000002": "炼金术师",
    "124000003": "探矿者", "93000003": "探矿者",
    "161000000": "远袭者", "107000000": "远袭者",
    "161000001": "粉碎者", "107000001": "粉碎者",
    "1000000": "兵营", "1000001": "大本营", "1000002": "圣水采集器", "1000003": "圣水瓶",
    "1000004": "金矿", "1000005": "储金罐", "1000006": "训练营", "1000007": "实验室",
    "1000008": "加农炮", "1000009": "箭塔", "1000010": "城墙", "1000011": "法师塔",
    "1000012": "防空火箭", "1000013": "迫击炮", "1000014": "部落城堡", "1000015": "工人小屋",
    "1000019": "特斯拉电磁塔", "1000020": "法术工厂", "1000021": "X连弩", "1000023": "暗黑重油钻井",
    "1000024": "暗黑重油罐", "1000026": "暗黑训练营", "1000027": "地狱塔", "1000028": "空气炮",
    "1000029": "暗黑法术工厂", "1000031": "天鹰火炮", "1000032": "炸弹塔", "1000059": "战车工坊",
    "1000064": "小博木屋", "1000067": "投石炮", "1000068": "战宠小屋", "1000070": "铁匠铺",
    "1000071": "英雄殿堂", "1000072": "法术塔", "1000077": "擎天巨柱", "1000079": "复合机械塔",
    "1000084": "多人箭塔", "1000085": "弹跳加农炮", "1000086": "复仇塔", "1000089": "火焰喷射器",
    "1000093": "帮手小屋", "1000097": "精制台",
    "152000008": "熔岩火炮", "103000008": "熔岩火炮",
    "151000024": "熔岩火炮-血量", "102000024": "熔岩火炮-血量",
    "151000025": "熔岩火炮-伤害", "102000025": "熔岩火炮-伤害",
    "151000026": "熔岩火炮-连发数量", "102000026": "熔岩火炮-连发数量",
    "152000009": "空中炸弹发射器", "103000009": "空中炸弹发射器",
    "151000027": "空中炸弹发射器-血量", "102000027": "空中炸弹发射器-血量",
    "151000028": "空中炸弹发射器-伤害", "102000028": "空中炸弹发射器-伤害",
    "151000029": "空中炸弹发射器-攻速", "102000029": "空中炸弹发射器-攻速",
    "152000010": "熔岩发射器", "103000010": "熔岩发射器",
    "151000030": "熔岩发射器-血量", "102000030": "熔岩发射器-血量",
    "151000031": "熔岩发射器-伤害", "102000031": "熔岩发射器-伤害",
    "151000032": "熔岩发射器-范围", "102000032": "熔岩发射器-范围",
    "1000102": "超级法师塔",
    "12000000": "隐形炸弹", "12000001": "弹簧", "12000002": "巨型炸弹", "12000005": "红雷",
    "12000006": "黑雷", "12000008": "骷髅陷阱", "12000016": "飓风陷阱", "12000020": "终极炸弹",
    "28000000": "蛮王", "28000001": "女王", "28000002": "永王", "28000003": "闰土",
    "28000004": "王子", "28000005": "战斗直升机", "28000006": "王子", "28000007": "公爵",
    "4000000": "野蛮人", "4000001": "弓箭手", "4000002": "哥布林", "4000003": "巨人",
    "4000004": "炸弹人", "4000005": "气球", "4000006": "法师", "4000007": "天使",
    "4000008": "飞龙", "4000009": "皮卡", "4000010": "亡灵", "4000011": "野猪骑士",
    "4000012": "武神", "4000013": "石头人", "4000015": "女巫", "4000017": "熔岩猎犬",
    "4000022": "蓝胖", "4000023": "龙宝", "4000024": "矿工", "4000053": "雪怪",
    "4000058": "冰人", "4000059": "雷龙", "4000065": "龙骑", "4000082": "英雄猎手",
    "4000095": "雷霆泰坦", "4000097": "守护者学徒", "4000110": "根蔓骑士", "4000123": "伊得鲁",
    "4000132": "巨矛", "4000150": "烈焰熔炉", "4000177": "陨石格伦",
    "4000051": "攻城战车", "4000052": "攻城飞艇", "4000062": "攻城气球", "4000075": "战营",
    "4000087": "滚木车", "4000091": "投石车", "4000092": "钻地机", "4000135": "部队发射器",
    "26000000": "闪电法术", "26000001": "治疗法术", "26000002": "狂暴法术", "26000003": "弹跳法术",
    "26000005": "冰冻法术", "26000009": "毒药法术", "26000010": "地震法术", "26000011": "极速法术",
    "26000016": "镜像法术", "26000017": "铁皮法术", "26000028": "蝙蝠法术", "26000035": "隐身法术",
    "26000053": "回溯法术", "26000070": "蔓生法术", "26000098": "复苏法术", "26000109": "图腾法术",
    "26000120": "冰障法术",
    "73000000": "莱西", "73000001": "大牦", "73000002": "闪枭", "73000003": "独角",
    "73000004": "凤凰", "73000007": "猛蜥", "73000008": "挖挖", "73000009": "冰牙",
    "73000010": "灵狐", "73000011": "水母", "73000016": "啾啾", "73000017": "乌鸦",
    "1000033": "城墙(夜)", "1000034": "建筑大师大本营", "1000035": "圣水采集器(夜)", "1000036": "圣水瓶(夜)",
    "1000037": "金矿(夜)", "1000038": "储金罐(夜)", "1000039": "时光钟楼", "1000040": "建筑大师训练营",
    "1000041": "双管加农炮", "1000042": "兵营(夜)", "1000043": "特斯拉电磁塔(夜)", "1000044": "加农炮(夜)",
    "1000045": "多管迫击炮", "1000046": "星空实验室", "1000048": "箭塔(夜)", "1000049": "预备营",
    "1000050": "防空火箭(夜)", "1000051": "守卫哨岗", "1000052": "超级特斯拉电磁塔", "1000053": "奥仔哨站",
    "1000054": "空中炸弹发射器(夜)", "1000055": "撼地巨石", "1000056": "熔岩火炮(夜)", "1000057": "巨型加农炮",
    "1000058": "宝石矿井", "1000063": "熔岩发射器(夜)", "1000065": "奥仔小屋", "1000078": "底座1",
    "1000080": "底座2", "1000081": "X连弩(夜)", "1000082": "治疗小屋",
    "12000010": "隐形弹簧", "12000011": "弹射陷阱", "12000013": "地雷(夜)", "12000014": "巨型地雷(夜)",
    "4000031": "狂暴野蛮人", "4000032": "隐秘弓箭手", "4000033": "异变亡灵", "4000034": "巨人拳击手",
    "4000035": "炸弹兵", "4000036": "雷霆皮卡", "4000037": "加农炮战车", "4000038": "骷髅气球",
    "4000041": "飞龙宝宝", "4000042": "暗夜女巫", "4000070": "野猪飞骑", "4000106": "电火法师"
};

const CATEGORY_NAMES = {
    "buildings": "建筑", "buildings2": "建筑(夜世界)", "heroes": "英雄", "heroes2": "英雄(夜世界)",
    "units": "兵种", "units2": "兵种(夜世界)", "spells": "法术", "siege_machines": "攻城机器",
    "pets": "战宠", "traps": "陷阱", "traps2": "陷阱(夜世界)", "guardians": "守卫"
};

// ========== 核心计算逻辑（从 HTML 移植） ==========

function calculateCompletionTimestamp(item, data) {
    const { timer, category } = item;
    const { timestamp } = data;
    let completionTimestamp = timestamp + timer;

    // 精制台等级2固定24小时
    if (item.name === "Refining Forge" && item.lvl === 2) {
        return timestamp + 86400;
    }

    const boosts = data.boosts || {};
    const helpers = data.helpers || [];
    const workerHelper = helpers.find(h => h.data === 93000000 || h.data === 124000000);
    const labHelper = helpers.find(h => h.data === 93000001 || h.data === 124000001);
    const itemHelperTimer = item.helper_timer || 0;

    switch (category) {
        case "buildings":
        case "heroes":
        case "traps":
        case "guardians":
            if (itemHelperTimer > 0 && workerHelper) {
                const helperLevel = workerHelper.lvl;
                const helperReduction = itemHelperTimer * helperLevel;
                if (helperReduction >= timer) {
                    const boostMultiplier = helperLevel + 1;
                    completionTimestamp = timestamp + Math.ceil(timer / boostMultiplier);
                } else {
                    completionTimestamp = timestamp + timer - helperReduction;
                }
            }
            if (boosts.builder_boost) {
                const boostReduction = boosts.builder_boost * 9;
                let ct2 = completionTimestamp - boostReduction;
                if (ct2 < timestamp) ct2 = timestamp + Math.ceil((completionTimestamp - timestamp) / 10);
                completionTimestamp = Math.min(completionTimestamp, ct2);
            } else if (boosts.builder_consumable) {
                const boostReduction = boosts.builder_consumable;
                let ct2 = completionTimestamp - boostReduction;
                if (ct2 < timestamp) {
                    const currentRemaining = completionTimestamp - timestamp;
                    ct2 = timestamp + Math.ceil(currentRemaining / 2);
                }
                completionTimestamp = Math.min(completionTimestamp, ct2);
            }
            break;

        case "units":
        case "siege_machines":
        case "spells":
            if (itemHelperTimer > 0 && labHelper) {
                const helperLevel = labHelper.lvl;
                const helperReduction = itemHelperTimer * helperLevel;
                if (helperReduction >= timer) {
                    const boostMultiplier = helperLevel + 1;
                    completionTimestamp = timestamp + Math.ceil(timer / boostMultiplier);
                } else {
                    completionTimestamp = timestamp + timer - helperReduction;
                }
            }
            if (boosts.lab_boost) {
                const boostReduction = boosts.lab_boost * 23;
                let ct2 = completionTimestamp - boostReduction;
                if (ct2 < timestamp) ct2 = timestamp + Math.ceil((completionTimestamp - timestamp) / 24);
                completionTimestamp = Math.min(completionTimestamp, ct2);
            } else if (boosts.lab_consumable) {
                const boostReduction = boosts.lab_consumable * 3;
                let ct2 = completionTimestamp - boostReduction;
                if (ct2 < timestamp) {
                    const currentRemaining = completionTimestamp - timestamp;
                    ct2 = timestamp + Math.ceil(currentRemaining / 4);
                }
                completionTimestamp = Math.min(completionTimestamp, ct2);
            }
            break;

        case "pets":
            if (boosts.pet_boost) {
                const boostReduction = boosts.pet_boost * 23;
                let petCt = timestamp + timer - boostReduction;
                if (petCt < timestamp) petCt = timestamp + Math.ceil(timer / 24);
                completionTimestamp = Math.min(completionTimestamp, petCt);
            } else if (boosts.lab_consumable) {
                const boostReduction = boosts.lab_consumable * 3;
                let petCt = completionTimestamp - boostReduction;
                if (petCt < timestamp) {
                    const currentRemaining = completionTimestamp - timestamp;
                    petCt = timestamp + Math.ceil(currentRemaining / 4);
                }
                completionTimestamp = Math.min(completionTimestamp, petCt);
            }
            break;

        case "buildings2":
        case "traps2":
        case "heroes2":
        case "units2":
            if (boosts.clocktower_boost) {
                const boostReduction = boosts.clocktower_boost * 9;
                let clockCt = timestamp + timer - boostReduction;
                if (clockCt < timestamp) clockCt = timestamp + Math.ceil(timer / 10);
                completionTimestamp = Math.min(completionTimestamp, clockCt);
            }
            break;
    }

    if (isNaN(completionTimestamp) || completionTimestamp < timestamp) {
        return timestamp + timer;
    }
    return completionTimestamp;
}

function extractUpgradingItems(data, nowTimestamp, includeCompleted) {
    const upgrading = [];
    const categories = ["buildings","buildings2","heroes","heroes2","units","units2","spells","siege_machines","pets","traps","traps2","guardians"];
    categories.forEach(cat => {
        if (data[cat] && Array.isArray(data[cat])) {
            data[cat].forEach((item, idx) => {
                // 精制台特殊处理
                if (item.data === 1000097 && item.types && Array.isArray(item.types)) {
                    item.types.forEach((type, tIdx) => {
                        if (type.modules && Array.isArray(type.modules)) {
                            type.modules.forEach((module, mIdx) => {
                                if (module.timer > 0) {
                                    const uniqueId = `refine_${cat}_${item.data}_${type.data}_${module.data}_${module.timer}_${tIdx}_${mIdx}`;
                                    const helperTimer = module.helper_timer || item.helper_timer || 0;
                                    const refinedItem = Object.assign({}, module, {
                                        category: cat,
                                        isRefiningTable: true,
                                        uniqueId,
                                        helper_timer: helperTimer,
                                        originalTimer: module.timer,
                                        lvl: module.lvl || 0
                                    });
                                    const completion = calculateCompletionTimestamp(refinedItem, data);
                                    if (includeCompleted || completion > nowTimestamp) {
                                        upgrading.push(refinedItem);
                                    }
                                }
                            });
                        }
                    });
                } else if (item.timer > 0) {
                    const uniqueId = `${cat}_${item.data}_${item.timer}_${item.lvl}`;
                    const newItem = Object.assign({}, item, { category: cat, uniqueId, originalTimer: item.timer });
                    const completion = calculateCompletionTimestamp(newItem, data);
                    if (includeCompleted || completion > nowTimestamp) {
                        upgrading.push(newItem);
                    }
                }
            });
        }
    });
    return upgrading;
}

function getItemCategory(item) {
    const cat = item.category;
    if (["buildings","heroes","traps","guardians"].includes(cat)) return "buildings";
    if (["units","siege_machines","spells"].includes(cat)) return "lab";
    if (cat === "pets") return "pets";
    if (["buildings2","traps2","heroes2"].includes(cat)) return "buildings2";
    if (cat === "units2") return "units2";
    return "buildings";
}

function getItemName(id) {
    return ITEM_NAMES[id?.toString()] || `未知(${id})`;
}

function formatDateTime(ts) {
    const d = new Date(ts * 1000);
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ========== 数据读取 ==========

function loadGameData() {
    if (!fs.existsSync(GAME_DATA_PATH)) {
        console.log('game_data.json 不存在，跳过检查');
        return {};
    }
    const raw = fs.readFileSync(GAME_DATA_PATH, 'utf8').trim();
    if (!raw) return {};
    try {
        const data = JSON.parse(raw);
        // 格式A: 有 accounts 字段 → HTML工具的完整格式
        if (data.accounts && typeof data.accounts === 'object') {
            return data.accounts;
        }
        // 格式B: 顶层有 timestamp → 单账号
        if (data.timestamp) {
            const tag = data.tag || 'default';
            return { [tag]: data };
        }
        // 格式C: 多账号对象 {tag: {timestamp:...}, ...}
        const firstKey = Object.keys(data)[0];
        if (firstKey && data[firstKey] && data[firstKey].timestamp) {
            return data;
        }
        console.log('无法识别 game_data.json 格式，请检查');
        return {};
    } catch (e) {
        console.error('game_data.json 解析失败:', e.message);
        return {};
    }
}

function loadNotifiedItems() {
    if (!fs.existsSync(NOTIFIED_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(NOTIFIED_PATH, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveNotifiedItems(items) {
    fs.writeFileSync(NOTIFIED_PATH, JSON.stringify(items, null, 2));
}

// ========== 通知发送 ==========

async function sendNtfyNotify(item, data, accountTag) {
    if (!NTFY_TOPIC) { console.log('NTFY_TOPIC 未配置'); return; }
    const name = getItemName(item.data);
    const catName = CATEGORY_NAMES[item.category] || item.category;
    const note = accountTag;
    const server = NTFY_SERVER.replace(/\/$/, '');
    try {
        const resp = await fetch(`${server}/${encodeURIComponent(NTFY_TOPIC)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: NTFY_TOPIC,
                title: '\u{1F3F0} 部落冲突 - 升级完成',
                message: `[${note}] 的 ${name} 已升级完成！(${catName} → Lv.${(item.lvl||0)+1})`,
                priority: 4,
                tags: ['white_check_mark']
            })
        });
        if (resp.ok) {
            console.log(`  通知已发送: ${name} (${note})`);
        } else {
            console.log(`  通知发送失败 HTTP ${resp.status}: ${name}`);
        }
    } catch (e) {
        console.error(`  通知发送异常: ${e.message}`);
    }
}

async function sendBarkNotify(item, data, accountTag) {
    if (!BARK_KEY) { console.log('BARK_KEY 未配置'); return; }
    const name = getItemName(item.data);
    const catName = CATEGORY_NAMES[item.category] || item.category;
    const note = accountTag;
    const title = encodeURIComponent('\u{1F3F0} 升级完成');
    const body = encodeURIComponent(`[${note}] 的 ${name} 已升级完成！(${catName} → Lv.${(item.lvl||0)+1})`);
    try {
        const resp = await fetch(`https://api.day.app/${encodeURIComponent(BARK_KEY)}/${title}/${body}?isArchive=1`);
        if (resp.ok) {
            console.log(`  通知已发送: ${name} (${note})`);
        } else {
            console.log(`  通知发送失败 HTTP ${resp.status}: ${name}`);
        }
    } catch (e) {
        console.error(`  通知发送异常: ${e.message}`);
    }
}

async function sendOneNotify(item, data, accountTag) {
    if (PROVIDER === 'bark') {
        await sendBarkNotify(item, data, accountTag);
    } else {
        await sendNtfyNotify(item, data, accountTag);
    }
}

// ========== 主逻辑 ==========

async function main() {
    console.log(`=== 升级检查 ${new Date().toISOString()} ===`);
    console.log(`通知方式: ${PROVIDER}`);

    // 测试模式：仅发送测试通知，不检查升级
    if (process.env.TEST_MODE === 'true') {
        console.log('--- 测试模式 ---');
        if (PROVIDER === 'bark') {
            if (!BARK_KEY) { console.log('BARK_KEY 未配置，无法发送测试通知'); return; }
            const title = encodeURIComponent('\u{1F9EA} 测试通知');
            const body = encodeURIComponent('Bark 通知配置成功！升级完成时你将收到类似推送。');
            try {
                const resp = await fetch(`https://api.day.app/${encodeURIComponent(BARK_KEY)}/${title}/${body}?isArchive=1`);
                console.log(resp.ok ? '测试通知已发送，请检查手机 Bark App' : `发送失败 HTTP ${resp.status}`);
            } catch(e) { console.error('发送异常:', e.message); }
        } else {
            if (!NTFY_TOPIC) { console.log('NTFY_TOPIC 未配置，无法发送测试通知'); return; }
            const server = NTFY_SERVER.replace(/\/$/, '');
            try {
                const resp = await fetch(`${server}/${encodeURIComponent(NTFY_TOPIC)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: NTFY_TOPIC,
                        title: '\u{1F9EA} 测试通知',
                        message: '如果你看到这条消息，说明 ntfy.sh 通知配置成功！升级完成时你将收到类似推送。',
                        priority: 4,
                        tags: ['white_check_mark']
                    })
                });
                console.log(resp.ok ? '测试通知已发送，请检查手机 ntfy App' : `发送失败 HTTP ${resp.status}`);
            } catch(e) { console.error('发送异常:', e.message); }
        }
        console.log('=== 测试完成 ===');
        return;
    }

    const accounts = loadGameData();
    const tags = Object.keys(accounts);
    if (tags.length === 0) {
        console.log('没有账号数据，退出');
        return;
    }
    console.log(`账号数量: ${tags.length} (${tags.join(', ')})`);

    // 检查数据是否太旧（>30天）
    const now = Math.floor(Date.now() / 1000);
    const maxTs = Math.max(...tags.map(t => accounts[t].timestamp || 0));
    if (now - maxTs > 30 * 86400) {
        console.log('所有账号数据超过30天未更新，跳过检查（所有升级已结束）');
        return;
    }

    const notifiedItems = loadNotifiedItems();
    console.log(`已通知记录: ${Object.keys(notifiedItems).length} 条`);

    let newNotified = 0;
    for (const tag of tags) {
        const data = accounts[tag];
        const items = extractUpgradingItems(data, now, true);
        const note = data.tag || tag;

        for (const item of items) {
            const completionTs = calculateCompletionTimestamp(item, data);
            if (completionTs <= now && !notifiedItems[item.uniqueId]) {
                const name = getItemName(item.data);
                const catName = CATEGORY_NAMES[item.category] || item.category;
                const doneTime = formatDateTime(completionTs);
                console.log(`\n[NEW] ${name} | ${note} | ${catName} → Lv.${(item.lvl||0)+1} | 完成于 ${doneTime}`);
                await sendOneNotify(item, data, note);
                notifiedItems[item.uniqueId] = completionTs;
                newNotified++;
            }
        }
    }

    // 清理已经不存在的项目记录
    const allIds = new Set();
    for (const tag of tags) {
        for (const item of extractUpgradingItems(accounts[tag], now, true)) {
            allIds.add(item.uniqueId);
        }
    }
    let cleaned = 0;
    for (const id of Object.keys(notifiedItems)) {
        if (!allIds.has(id)) { delete notifiedItems[id]; cleaned++; }
    }

    if (newNotified > 0 || cleaned > 0) {
        saveNotifiedItems(notifiedItems);
        console.log(`\n已保存: ${newNotified} 条新通知, ${cleaned} 条清理`);
    } else {
        console.log('\n没有新的完成项目');
    }
    console.log('=== 检查完成 ===\n');
}

main().catch(e => {
    console.error('脚本异常:', e);
    process.exit(1);
});
