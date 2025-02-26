/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50738 (5.7.38)
 Source Host           : localhost:3306
 Source Schema         : acore_characters

 Target Server Type    : MySQL
 Target Server Version : 50738 (5.7.38)
 File Encoding         : 65001

 Date: 25/02/2025 10:38:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _wyweb商城
-- ----------------------------
DROP TABLE IF EXISTS `_wyweb商城`;
CREATE TABLE `_wyweb商城`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '商品名称',
  `itemId` int(11) NOT NULL COMMENT '物品ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '商品描述',
  `price` int(11) NOT NULL COMMENT '价格(铜币)',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图片URL',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '物品图标名称',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '其他' COMMENT '商品分类',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of _wyweb商城
-- ----------------------------
INSERT INTO `_wyweb商城` VALUES (1, '凤凰', 2454, '凤凰坐骑', 10, 'https://huiji-public.huijistatic.com/warcraft/uploads/c/c8/Inv_alchemy_elixir_03.png', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:48', '消耗品');
INSERT INTO `_wyweb商城` VALUES (2, '药剂', 2454, '药剂', 1, 'https://huiji-public.huijistatic.com/warcraft/uploads/6/66/Inv_alchemy_potion_02.png', NULL, '2025-02-25 09:35:46', '2025-02-25 10:30:26', '消耗品');
INSERT INTO `_wyweb商城` VALUES (3, '凤凰', 2454, '凤凰坐骑', 10, 'https://huiji-public.huijistatic.com/warcraft/uploads/e/ea/Inv_potion_42.png', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:50', '消耗品');
INSERT INTO `_wyweb商城` VALUES (4, '凤凰', 2454, '凤凰坐骑', 10, 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1pDbfB.img?w=600&h=600&m=6&f=webp', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:52', '消耗品');
INSERT INTO `_wyweb商城` VALUES (5, '123', 2454, '凤凰坐骑', 10, 'https://huiji-public.huijistatic.com/warcraft/uploads/8/82/Inv_alchemy_endlessflask_03.png', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:52', '消耗品');
INSERT INTO `_wyweb商城` VALUES (6, '测试1', 2454, '凤凰坐骑', 10, 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1pDbfB.img?w=600&h=600&m=6&f=webp', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:53', '消耗品');
INSERT INTO `_wyweb商城` VALUES (7, '测试1', 2454, '凤凰坐骑', 10, 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1pDbfB.img?w=600&h=600&m=6&f=webp', NULL, '2025-02-25 09:22:40', '2025-02-25 10:27:55', '消耗品');

SET FOREIGN_KEY_CHECKS = 1;




/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50738 (5.7.38)
 Source Host           : localhost:3306
 Source Schema         : acore_characters

 Target Server Type    : MySQL
 Target Server Version : 50738 (5.7.38)
 File Encoding         : 65001

 Date: 25/02/2025 10:38:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _wyweb商城购买记录
-- ----------------------------
DROP TABLE IF EXISTS `_wyweb商城购买记录`;
CREATE TABLE `_wyweb商城购买记录`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '账号名',
  `character_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名',
  `item_id` int(11) NOT NULL COMMENT '物品ID',
  `item_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '物品名称',
  `price` int(11) NOT NULL COMMENT '价格(积分)',
  `amount` int(11) NOT NULL DEFAULT 1 COMMENT '数量',
  `soap_command` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '执行的SOAP命令',
  `soap_result` tinyint(1) NOT NULL COMMENT 'SOAP执行结果',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '错误信息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_character`(`character_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;