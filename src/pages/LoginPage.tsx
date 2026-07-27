import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

type Mode = 'login' | 'signup';

interface FormValues {
  email: string;
  password: string;
  nickname: string;
}

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // 로그인 후 원래 가려던 곳으로 돌려보낸다
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      if (mode === 'login') {
        await login(values.email, values.password);
      } else {
        await signup(values.email, values.password, values.nickname);
      }
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : '요청에 실패했습니다.');
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setServerError(null);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="sr-only">{mode === 'login' ? '로그인' : '회원가입'}</h1>
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            로그인
          </button>
          <button
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="login-field">
            <span>이메일</span>
            <input
              type="email"
              autoComplete="email"
              {...register('email', { required: '이메일을 입력해주세요.' })}
            />
            {errors.email && <em className="login-error">{errors.email.message}</em>}
          </label>

          {mode === 'signup' && (
            <label className="login-field">
              <span>닉네임</span>
              <input
                type="text"
                {...register('nickname', {
                  required: mode === 'signup' ? '닉네임을 입력해주세요.' : false,
                })}
              />
              {errors.nickname && (
                <em className="login-error">{errors.nickname.message}</em>
              )}
            </label>
          )}

          <label className="login-field">
            <span>비밀번호</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: mode === 'signup'
                  ? { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' }
                  : undefined,
              })}
            />
            {errors.password && (
              <em className="login-error">{errors.password.message}</em>
            )}
          </label>

          {serverError && <div className="login-server-error">{serverError}</div>}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중…' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
