-- 在 account 表中添加积分字段(如果还没有的话)
ALTER TABLE `account` 
ADD COLUMN `jf` INT NOT NULL DEFAULT 0 COMMENT '积分';