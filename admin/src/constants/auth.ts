// 统一管理后台 token 存储的 key，避免读取/写入不一致
export const AUTH_TOKEN_KEY = 'solo_admin_token';

// 兼容旧版本使用的 token key，启动时如果发现则迁移到新 key
export const LEGACY_TOKEN_KEYS = ['token'];
