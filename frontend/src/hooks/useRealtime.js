import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

export const useRealtime = () => {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !user) return;

    // Khởi tạo kết nối SSE (Server-Sent Events )
    const sseUrl = `http://localhost:5001/api/notifications/realtime?token=${token}`;
    /**
     * Trình duyệt sử dụng new EventSource() để mở một cổng nghe ngầm định từ Server.
     * Khi có người trong nhóm chat, Server đẩy một tín hiệu qua cổng này.
     * Trình duyệt nghe thấy thông qua: eventSource.addEventListener('new_comment', ...)
     */
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[SSE] Đã kết nối tới máy chủ thời gian thực.');
    };

    // Lắng nghe thông báo mới
    eventSource.addEventListener('new_notification', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Nhận thông báo mới:', data);

        // Hiển thị Toast thông báo đẹp mắt
        toast.info(data.title, {
          description: data.message,
          duration: 6000,
        });

        // Tải lại số lượng thông báo chưa đọc và danh sách thông báo
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (err) {
        console.error('[SSE] Lỗi phân tích sự kiện new_notification:', err);
      }
    });

    eventSource.addEventListener('update_notifications', (event) => {
      try {
        console.log('[SSE] Cập nhật thông báo đã đọc');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (err) {
        console.error('[SSE] Lỗi sự kiện update_notifications:', err);
      }
    });

    // Lắng nghe bình luận/ghi chú mới
    eventSource.addEventListener('new_comment', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Nhận bình luận mới:', data);

        const wsIdNum = Number(data.workspaceId);
        const wsIdStr = String(data.workspaceId);
        const taskIdNum = Number(data.taskId);
        const taskIdStr = String(data.taskId);

        // Tải lại danh sách bình luận cho task (nếu đang mở Modal)
        // Invalidate bằng cả kiểu string và number để chắc chắn trùng khớp với queryKey trong React Query
        queryClient.invalidateQueries({ 
          queryKey: ['taskComments', wsIdNum, taskIdNum] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['taskComments', wsIdStr, taskIdNum] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['taskComments', wsIdStr, taskIdStr] 
        });

        // Tải lại danh sách công việc của workspace để cập nhật comment count badge thời gian thực
        queryClient.invalidateQueries({ 
          queryKey: ['workspaceTasks', wsIdNum] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['workspaceTasks', wsIdStr] 
        });
      } catch (err) {
        console.error('[SSE] Lỗi phân tích sự kiện new_comment:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('[SSE] Lỗi kết nối hoặc mất kết nối:', err);
      eventSource.close();
    };

    return () => {
      console.log('[SSE] Đang đóng kết nối.');
      eventSource.close();
    };
  }, [token, user, queryClient]);
};
