import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from 'sonner';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Nếu đã đăng nhập thì tự động chuyển vào Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Xử lý sự kiện đăng nhập thủ công bằng tài khoản thường (Email + Mật khẩu)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Chào mừng bạn trở lại!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Đăng nhập thất bại');
    }
  };

  // Xử lý sự kiện đăng nhập Google thành công (Nhận Token từ Google và gửi lên backend xác thực)
  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success('Đăng nhập Google thành công!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Đăng nhập Google thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-[440px] space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/30 mb-2 rotate-3 hover:rotate-0 transition-transform duration-500">
            <CalendarDays className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Calendar<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground font-medium">Làm chủ thời gian, tối ưu hiệu suất</p>
        </div>

        <div className="bg-card border border-border/50 p-8 rounded-[32px] shadow-2xl shadow-black/5 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Chào mừng trở lại</h2>
            <p className="text-sm text-muted-foreground">Nhập thông tin để tiếp tục trải nghiệm</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Địa chỉ Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (error) clearError();
                  }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (error) clearError();
                  }}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Đăng nhập <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-bold">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"}>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast.error('Đăng nhập Google thất bại');
                  }}
                  useOneTap
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="continue_with"
                />
              </div>
            </GoogleOAuthProvider>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
