"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Mail, User, Building2, ArrowRight, X, Sparkles, AlertCircle } from "lucide-react";
import { registerUser, loginUser, loginGuestUser } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "register" | "login";
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "register",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"register" | "login">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!email || !password || !name || !companyName) {
          setErrorMsg("모든 필수 항목을 입력해 주세요.");
          setLoading(false);
          return;
        }
        const res = await registerUser({
          email: email.trim(),
          password,
          name: name.trim(),
          company_name: companyName.trim(),
        });
        onSuccess(res.user);
        onClose();
      } else {
        if (!email || !password) {
          setErrorMsg("이메일과 비밀번호를 입력해 주세요.");
          setLoading(false);
          return;
        }
        const res = await loginUser({
          email: email.trim(),
          password,
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "인증 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더 */}
        <div className="text-center">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === "register" ? "간편 회원가입" : "로그인"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "register"
              ? "최소한의 정보 입력으로 우리 회사 맞춤 안전문화 진단을 시작하세요."
              : "등록된 계정으로 로그인하여 진단을 이어가세요."}
          </p>
        </div>

        {/* 탭 전환 */}
        <div className="flex border-b border-slate-200 mt-5">
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === "register" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            간편 회원가입
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(""); }}
            className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
              mode === "login" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            로그인
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const guest = loginGuestUser(name || "모바일 체험자", companyName || "우수안전산업");
                onSuccess(guest);
                onClose();
              }}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white border border-rose-300 text-rose-800 text-[11px] font-bold hover:bg-rose-100/70 transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>오프라인/체험 게스트 모드로 즉시 접속하기</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  회사명 / 사업장명 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="예: (주)한국안전정밀"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  담당자 성명 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동 팀장"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              이메일 주소 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="safety@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              비밀번호 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="6자리 이상 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? "처리 중..." : mode === "register" ? "간편 가입하고 진단 시작" : "로그인"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
