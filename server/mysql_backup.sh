#!/bin/bash

# MySQL备份脚本

# 配置信息
DB_USER="solo_user"
DB_PASSWORD="SoloAppPassword2025!"
DB_NAME="solo_db"
BACKUP_DIR="/Users/russell/solo超群官网/server/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 执行备份
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" --single-transaction --routines --triggers > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "$(date): 备份成功 - ${DB_NAME}_${DATE}.sql"
    
    # 压缩备份文件
    gzip "$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
    echo "$(date): 备份文件已压缩"
    
    # 删除7天前的备份文件，保留最近7天
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete
    echo "$(date): 已删除7天前的备份文件"
else
    echo "$(date): 备份失败！" >&2
fi
