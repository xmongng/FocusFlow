import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null, // 'eventForm' | 'taskForm' | 'categoryForm'
  selectedEvent: null,
  selectedTask: null,
  sidebarHovered: false,
  
  // Bật/tắt Sidebar (Thanh điều hướng bên cạnh)
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Đặt trạng thái Sidebar mở hoặc đóng cố định
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Trạng thái hover của Sidebar
  setSidebarHovered: (hovered) => set({ sidebarHovered: hovered }),
  
  // Mở một Hộp thoại (Modal) cụ thể và lưu kèm dữ liệu cần chỉnh sửa (nếu có)
  openModal: (modalType, data = null) => set({ 
    activeModal: modalType, 
    selectedEvent: modalType === 'eventForm' ? data : null,
    selectedTask: modalType === 'taskForm' ? data : null,
  }),
  
  // Đóng toàn bộ các Hộp thoại (Modal) đang hoạt động và reset dữ liệu lưu trữ
  closeModal: () => set({ 
    activeModal: null, 
    selectedEvent: null, 
    selectedTask: null 
  }),
}));
