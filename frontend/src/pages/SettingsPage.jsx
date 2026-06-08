import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette, 
  ChevronRight,
  Plus,
  Check,
  Camera,
  Zap,
  Layout as LayoutIcon,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Switch from '../components/ui/Switch';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';

const SETTINGS_NAV = [
  { id: 'profile', label: 'Hồ sơ', icon: User },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'security', label: 'Bảo mật', icon: Lock },
  { id: 'language', label: 'Ngôn ngữ & Giờ', icon: Globe },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
];

const categories = [
  { id: 1, name: 'Công việc', icon: '💼', color: '#4A90D9' },
  { id: 2, name: 'Học tập', icon: '🎓', color: '#7B68EE' },
  { id: 3, name: 'Sức khoẻ', icon: '🏃', color: '#2ECC71' },
  { id: 4, name: 'Cá nhân', icon: '👤', color: '#F39C12' },
];

const notifications = [
  { id: 1, title: 'Thông báo nhắc nhở', desc: 'Nhận thông báo khi sắp đến sự kiện hoặc hạn chót.', enabled: true },
  { id: 2, title: 'Thông báo quá hạn', desc: 'Nhận thông báo khi công việc đã quá hạn.', enabled: true },
  { id: 3, title: 'Bản tin hàng ngày', desc: 'Gửi tóm tắt lịch trình mỗi buổi sáng vào email.', enabled: false },
  { id: 4, title: 'Thông báo AI', desc: 'Nhận gợi ý tối ưu hóa thời gian từ trợ lý AI.', enabled: true },
];

const SettingsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [activeTab, setActiveTab] = useState('general');
  const [notifState, setNotifState] = useState(
    Object.fromEntries(notifications.map(n => [n.id, n.enabled]))
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Left Nav — fixed width */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <LayoutIcon className="h-5 w-5" />
            Cài đặt chung
          </button>
          

          <nav className="flex flex-col gap-1 p-1 bg-muted/20 rounded-2xl border">
            {SETTINGS_NAV.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content — takes remaining space */}
        <div className="flex-1 w-full space-y-6">

          {/* ── PROFILE ── */}
          {activeSection === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>Cập nhật tên và địa chỉ email của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar row */}
                  <div className="flex items-center gap-5 pb-6 border-b border-border">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-background shadow">
                        {user?.display_name?.charAt(0).toUpperCase() || 'J'}
                      </div>
                      <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-base">{user?.display_name || 'John Doe'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || 'john@example.com'}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Thay đổi ảnh</Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">Xóa ảnh</Button>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Tên hiển thị</Label>
                      <Input id="displayName" defaultValue={user?.display_name || 'John Doe'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user?.email || 'john@example.com'} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button>Lưu thay đổi</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>Danh mục</CardTitle>
                    <CardDescription>Quản lý các danh mục phân loại sự kiện và công việc.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Thêm mới
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border rounded-xl border overflow-hidden">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between px-4 py-3.5 bg-card hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center text-xl shadow-sm">
                            {cat.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{cat.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-xs text-muted-foreground font-mono uppercase">{cat.color}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/40">
                <CardHeader>
                  <CardTitle className="text-destructive">Khu vực nguy hiểm</CardTitle>
                  <CardDescription>Các hành động dưới đây không thể hoàn tác.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-semibold">Xóa tài khoản</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Xóa vĩnh viễn tất cả dữ liệu của bạn.</p>
                    </div>
                    <Button variant="destructive" size="sm">Xóa tài khoản</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt thông báo</CardTitle>
                <CardDescription>Chọn cách bạn muốn nhận thông báo từ ứng dụng.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5 pr-8">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifState[item.id]}
                        onCheckedChange={(val) => setNotifState(prev => ({ ...prev, [item.id]: val }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── SECURITY ── */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật</CardTitle>
                <CardDescription>Quản lý mật khẩu và bảo mật tài khoản.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mật khẩu hiện tại</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button>Đổi mật khẩu</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── LANGUAGE ── */}
          {activeSection === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>Ngôn ngữ & Múi giờ</CardTitle>
                <CardDescription>Điều chỉnh ngôn ngữ hiển thị và múi giờ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ngôn ngữ</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Múi giờ</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</option>
                    <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div className="flex justify-end pt-2">
                  <Button>Lưu thay đổi</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── APPEARANCE ── */}
          {activeSection === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Giao diện</CardTitle>
                <CardDescription>Tùy chỉnh giao diện của ứng dụng.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-3">Chủ đề màu sắc</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Sáng', value: 'light' },
                        { label: 'Tối', value: 'dark' },
                        { label: 'Hệ thống', value: 'system' },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                            theme.value === 'light'
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {theme.value === 'light' && <Check className="h-4 w-4" />}
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
