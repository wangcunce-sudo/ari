/**
 * useScrollLock
 * 用引用计数管理 body overflow:hidden。
 * 多个组件（CartSidebar、AuthModal 等）可同时调用，
 * 只有当所有组件都关闭后，overflow 才会被解除。
 * 避免一个组件关闭时把另一个还开着的组件的滚动锁解掉。
 */
'use client';

import { useEffect } from 'react';

// 模块级引用计数 — 跨组件共享
let lockCount = 0;

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockCount++;
    document.body.style.overflow = 'hidden';

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0; // 防止负数
        document.body.style.overflow = '';
      }
    };
  }, [locked]);
}
