print(">>>  Loading _WYwebChat   ")

-- 配置
local Config = {
    use = 3, -- 0-说 1-喊 2-官员 3-所有自定义频道
    min_level = 10, -- 设置最低等级限制
    channel_name = "世界", -- 频道名称
    chat_interval = 3 -- 聊天间隔时间(秒)
}

-- 创建数据库表
CharDBQuery([[CREATE TABLE IF NOT EXISTS `_WYweb聊天记录` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `账号ID` INT(11) NOT NULL,
    `账号名称` VARCHAR(50) NOT NULL,
    `角色ID` INT(11) NOT NULL,
    `角色名称` VARCHAR(100) NOT NULL,
    `角色种族` INT(11) NOT NULL,
    `角色职业` INT(11) NOT NULL,
    `消息内容` VARCHAR(2000) NOT NULL,
    `是否转发` TINYINT(1) NOT NULL DEFAULT 1,
    `创建时间` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB;]])

-- 颜色定义
local Colors = {
    [0] = "|cff3399FF联盟",
    [1] = "|cffFF9933部落",
    [3] = "|cff20ff20",
    [4] = "|cff20ff20",
    [5] = "|cff3399ff",
    [6] = "|cffFF0000",
    [11] = "|cffC79C6E", -- 战士
    [12] = "|cffF58CBA", -- 圣骑士
    [13] = "|cffABD476", -- 猎人
    [14] = "|cffFFF569", -- 盗贼
    [15] = "|cffFFFFFF", -- 牧师
    [16] = "|cffC41F3B", -- 萨满
    [17] = "|cff0070DE", -- 死亡骑士
    [18] = "|cff69CCF0", -- 法师
    [19] = "|cff9482C9", -- 术士
    [21] = "|cffFF7D0A"  -- 德鲁伊
}

-- 世界聊天状态存储
local WorldChat = {}

-- 记录聊天信息到数据库
local function SaveChatMessage(player, message)
    local sql = "INSERT INTO `_WYweb聊天记录` (`账号ID`, `账号名称`, `角色ID`, `角色名称`, `角色种族`, `角色职业`, `消息内容`, `是否转发`) VALUES (%s,'%s',%s,'%s',%s,%s,'%s',0);"
    message = string.gsub(message, "\\", "\\\\")
    message = string.gsub(message, "'", "''")
    message = string.gsub(message, ";", "")
    CharDBExecute(string.format(sql,
        player:GetAccountId(),
        player:GetAccountName(),
        player:GetGUIDLow(),
        player:GetName(),
        player:GetRace(),
        player:GetClass(),
        message
    ))
end

-- 聊天处理函数
local function OnChat(event, player, msg, type, lang, channel)
    -- 检查聊天类型
    if Config.use == 0 and type ~= 1 then return end
    if Config.use == 1 and type ~= 6 then return end
    if Config.use == 2 and type ~= 5 then return end
    if Config.use == 3 and string.find(msg, "LFW_") then return end
    
    -- 初始化玩家聊天状态
    local acct_id = player:GetAccountId()
    if not WorldChat[acct_id] then
        WorldChat[acct_id] = {
            chat = 0,
            time = GetGameTime() - Config.chat_interval
        }
    end

    if lang ~= -1 and msg ~= "" and msg ~= "离开" then
        -- 保存聊天记录
        SaveChatMessage(player, msg)

        -- 处理世界聊天
        if WorldChat[acct_id].chat == 0 then
            local time = GetGameTime()
            if time - WorldChat[acct_id].time >= Config.chat_interval then
                if player:GetLevel() < Config.min_level then
                    player:SendBroadcastMessage(Colors[6].."你的等级低于"..Config.min_level.."级，无法使用世界聊天。|r")
                    return false
                end

                local classid = player:GetClass()
                local message = table.concat{
                    "[", Colors[3], Config.channel_name, "|r]",
                    "[", Colors[player:GetTeam()], "|r]",
                    "[|Hplayer:", player:GetName(), "|h",
                    Colors[classid + 10], player:GetName(), "|r|h", "|r]:",
                    Colors[4], msg, "|r"
                }
                SendWorldMessage(message)
                WorldChat[acct_id].time = time
            else
                player:SendBroadcastMessage(Colors[6].."世界聊天间隔时间为"..Config.chat_interval.."秒，请遵守游戏规则，勿刷屏。|r")
            end
            return false
        end
    end
end

-- 消息转发函数
local function ForwardMessages()
    local Q = CharDBQuery("SELECT id, 角色名称, 消息内容 FROM _WYweb聊天记录 WHERE 是否转发 = 1")
    if Q then
        local ids = {}
        repeat
            local id = Q:GetInt32(0)
            local name, msg = Q:GetString(1), Q:GetString(2)
            table.insert(ids, id)
            SendWorldMessage(string.format("|cFFFF6EB4【网页】|r|cFFFFFF00%s|r:|cFF00FF00%s|r", name, msg))
        until not Q:NextRow()
        if #ids > 0 then
            CharDBQuery("UPDATE _WYweb聊天记录 SET 是否转发 = 0 WHERE id IN ("..table.concat(ids, ",")..")")
        end
    end
end

-- 注册事件
if Config.use == 0 or Config.use == 1 then
    RegisterPlayerEvent(18, OnChat)
elseif Config.use == 2 then
    RegisterPlayerEvent(21, OnChat)
elseif Config.use == 3 then
    RegisterPlayerEvent(22, OnChat)
end

-- 创建消息转发定时器
CreateLuaEvent(ForwardMessages, 2000, 0) -- 每2秒执行一次ForwardMessages函数