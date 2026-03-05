/**
 * Feature Flags 功能开关配置
 * 
 * 通过这个文件统一管理所有新功能的启用/禁用状态。
 * 设置为 false 即可关闭对应功能，不会影响主代码。
 */

export const FEATURES = {
    /** 待定事件功能：在 Room 中创建待定事件（会议、活动等） */
    PENDING_EVENTS: true,

    // 在此添加更多功能开关...
    // EXAMPLE_FEATURE: false,
} as const;
