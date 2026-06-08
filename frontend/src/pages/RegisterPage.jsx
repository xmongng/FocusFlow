import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    const result = await register({
      display_name: formData.display_name,
      username: formData.username || formData.email.split('@')[0],
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/30 mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Calendar<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-medium">Bắt đầu hành trình quản lý thời gian</p>
        </div>

        <div className="bg-card border border-border/50 p-8 rounded-[32px] shadow-2xl shadow-black/5 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Tạo tài khoản mới</h2>
            <p className="text-sm text-muted-foreground">Điền thông tin bên dưới để đăng ký</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Họ và tên</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="display_name"
                  placeholder="Nguyễn Văn A" 
                  className="pl-11 h-11 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-11 h-11 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-11 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-11 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 mt-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Đăng ký ngay <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
