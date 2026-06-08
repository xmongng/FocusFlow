import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { Bell, MapPin, Calendar as CalendarIcon, Clock, Flag, Tag, Palette } from 'lucide-react';
import { categoriesApi, tasksApi } from '../../api';
import { toast } from 'sonner';
import dayjs from '../../lib/dateFormat';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const ModalManager = () => {
  const queryClient = useQueryClient();
  const { activeModal, closeModal } = useUiStore();

  // --- Dữ liệu danh mục ---
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list()
  });

  // --- Task Form State ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    start_time: '',
    priority: '2',
    category_id: '',
    source: 'Custom'
  });

  // Reset form when modal opens
  useEffect(() => {
    if (activeModal === 'taskForm' || activeModal === 'eventForm') {
      setFormData({
        title: '',
        description: '',
        date: dayjs().format('YYYY-MM-DD'),
        start_time: '',
        priority: '2',
        category_id: '',
        source: 'Custom'
      });
    }
  }, [activeModal]);

  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã thêm công việc mới');
      closeModal();
    }
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề công việc');
      return;
    }

    const finalDueDate = formData.date 
      ? (formData.start_time ? `${formData.date} ${formData.start_time}:00` : `${formData.date} 23:59:59`)
      : null;
    
    createTaskMutation.mutate({
      title: formData.title,
      description: formData.description,
      due_date: finalDueDate,
      priority: formData.priority,
      category_id: formData.category_id,
      source: formData.source
    });
  };

  // --- Logic cho CATEGORY ---
  const [catData, setCatData] = useState({ name: '', color: '#4A90D9', icon: '📅' });
  const createCatMutation = useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Đã tạo danh mục mới');
      closeModal();
    }
  });

  // --- Logic cho WORKSPACE ---
  const { createWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [workspaceData, setWorkspaceData] = useState({ name: '', description: '', color: '#4A90D9' });
  const createWorkspaceMutation = useMutation({
    mutationFn: (data) => createWorkspace(data),
    onSuccess: () => {
      fetchWorkspaces();
      toast.success('Đã tạo Workspace mới');
      setWorkspaceData({ name: '', description: '', color: '#4A90D9' });
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo Workspace');
    }
  });

  return (
    <>
      {/* 📝 TASK MODAL */}
      <Dialog
        open={activeModal === 'taskForm' || activeModal === 'eventForm'}
        onOpenChange={closeModal}
        title="Thêm công việc mới"
        description="Tạo một công việc cần làm mới."
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tiêu đề công việc</Label>
            <Input 
              placeholder="VD: Hoàn thành báo cáo, Họp team..."
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Mô tả / Ghi chú</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nhập mô tả hoặc ghi chú thêm cho công việc..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Tag className="h-3 w-3" /> Danh mục</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Chọn danh mục...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Flag className="h-3 w-3" /> Ưu tiên</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="1">1 (Quan trọng)</option>
                <option value="2">2 (Trung bình)</option>
                <option value="3">3 (Thấp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarIcon className="h-3 w-3" /> Ngày</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Giờ (Tùy chọn)</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeModal}>Hủy</Button>
            <Button onClick={handleSave}>Lưu công việc</Button>
          </div>
        </div>
      </Dialog>

      {/* 🏷️ MODAL DANH MỤC */}
      <Dialog 
        open={activeModal === 'categoryForm'} 
        onOpenChange={closeModal}
        title="Tạo danh mục mới"
        description="Phân loại công việc của bạn theo màu sắc."
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tên danh mục</Label>
            <Input 
              placeholder="VD: Công ty, Freelance..." 
              value={catData.name}
              onChange={(e) => setCatData({...catData, name: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Palette className="h-3 w-3" /> Màu sắc</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  className="h-10 w-16 p-1 cursor-pointer"
                  value={catData.color}
                  onChange={(e) => setCatData({...catData, color: e.target.value})}
                />
                <span className="text-xs font-mono text-muted-foreground">{catData.color.toUpperCase()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2">Biểu tượng</Label>
              
              <div className="grid grid-cols-6 gap-2">
                {['📅', '💼', '🎓', '🏃', '🛒', '💡', '❤️', '✈️', '🏠', '💰', '🎮', '🌟'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCatData({...catData, icon})}
                    className={cn(
                      "h-10 w-full flex items-center justify-center rounded-xl border text-lg transition-all",
                      catData.icon === icon ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30" : "border-border hover:bg-muted"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 mt-2">
                <span className="text-[11px] text-muted-foreground font-medium">Hoặc sử dụng emoji tuỳ chọn:</span>
                <Input 
                  className="w-12 text-center text-lg h-9 p-0 shadow-sm rounded-lg border-border focus:border-primary"
                  value={catData.icon}
                  onChange={(e) => setCatData({...catData, icon: e.target.value})}
                  maxLength={2}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeModal}>Hủy</Button>
            <Button onClick={() => createCatMutation.mutate(catData)}>Tạo danh mục</Button>
          </div>
        </div>
      </Dialog>

      {/* 🏢 MODAL TẠO WORKSPACE */}
      <Dialog
        open={activeModal === 'workspaceForm'}
        onOpenChange={closeModal}
        title="Tạo Workspace mới"
        description="Không gian làm việc chung cho nhóm của bạn."
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tên Workspace</Label>
            <Input 
              placeholder="VD: Dự án Marketing, Team DEV..." 
              value={workspaceData.name}
              onChange={(e) => setWorkspaceData({...workspaceData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Mô tả (Không bắt buộc)</Label>
            <Input 
              placeholder="Mô tả ngắn gọn về không gian làm việc này..." 
              value={workspaceData.description}
              onChange={(e) => setWorkspaceData({...workspaceData, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Palette className="h-3 w-3" /> Màu chủ đạo</Label>
            <div className="flex items-center gap-3">
              <Input 
                type="color" 
                className="h-10 w-16 p-1 cursor-pointer"
                value={workspaceData.color}
                onChange={(e) => setWorkspaceData({...workspaceData, color: e.target.value})}
              />
              <span className="text-xs font-mono text-muted-foreground">{workspaceData.color.toUpperCase()}</span>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeModal}>Hủy</Button>
            <Button onClick={() => createWorkspaceMutation.mutate(workspaceData)} disabled={createWorkspaceMutation.isPending}>
              {createWorkspaceMutation.isPending ? 'Đang tạo...' : 'Tạo Workspace'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ModalManager;
