"use client";
import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Cloud, Mail, LockKeyhole, ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "forgot" | "reset";
function authMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const messages: Record<string, string> = {
    invalid_credentials: "Email 或密碼不正確。",
    email_not_confirmed: "請先開啟驗證信完成 Email 驗證，再登入。",
    user_already_exists: "此 Email 已有帳號，請改用登入或忘記密碼。",
    weak_password:
      "密碼強度不足，請使用至少 8 個字元，並混合大小寫、數字與符號。",
    same_password: "新密碼必須與舊密碼不同。",
    over_email_send_rate_limit: "寄信次數已達限制，請稍後再試。",
    over_request_rate_limit: "操作太頻繁，請稍後再試。",
    email_address_not_authorized:
      "網站寄信服務尚未開放此 Email，請聯絡管理者完成寄信設定。",
    signup_disabled: "網站目前未開放註冊。",
    session_not_found: "連結或登入狀態已失效，請重新登入或重新申請重設密碼。",
    otp_expired: "驗證連結已過期，請重新申請。",
  };
  return messages[code] ?? "目前無法完成操作，請檢查網路或稍後再試。";
}
export function AuthGate({
  children,
}: {
  children: (session: Session, signOut: () => Promise<void>) => ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [boot, setBoot] = useState(0);
  useEffect(() => {
    let active = true;
    let authRevision = 0;
    let unsubscribe = () => {};
    try {
      const client = getSupabase();
      setConfigured(!!client);
      if (!client) {
        setLoading(false);
        return;
      }
      // Capture link errors before the SDK removes the hash. Do not display raw URLs/tokens.
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.has("error")) setError("驗證連結無效或已過期，請重新申請。");
      if (hash.get("type") === "recovery") setMode("reset");
      const { data } = client.auth.onAuthStateChange((event, next) => {
        if (!active) return;
        authRevision++;
        setSession(next);
        setLoading(false);
        if (event === "PASSWORD_RECOVERY") setMode("reset");
        if (event === "SIGNED_OUT") {
          setMode("login");
          setPassword("");
          setConfirm("");
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
      const readRevision = authRevision;
      void client.auth
        .getSession()
        .then(({ data, error: issue }) => {
          if (!active || authRevision !== readRevision) return;
          if (issue) setError(authMessage(issue));
          setSession(data.session);
          setLoading(false);
        })
        .catch(() => {
          if (active) {
            setError("無法讀取登入狀態，請重試。");
            setLoading(false);
          }
        });
    } catch {
      setConfigured(false);
      setError("帳號服務設定不完整，請聯絡網站管理者。");
      setLoading(false);
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [boot]);
  async function signOut() {
    const client = getSupabase();
    if (!client) return;
    const { error: issue } = await client.auth.signOut({ scope: "local" });
    if (issue) throw new Error("登出失敗，請檢查網路後重試。");
    setSession(null);
    setMode("login");
    setMessage("已登出，雲端學習紀錄會保留。");
  }
  if (session && mode !== "reset") return <>{children(session, signOut)}</>;
  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setMessage("");
    setPassword("");
    setConfirm("");
  }
  async function resendConfirmation() {
    if (busy) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("請先填寫有效的 Email，再重寄驗證信。");
      return;
    }
    const client = getSupabase();
    if (!client) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error: issue } = await client.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/" },
      });
      if (issue) throw issue;
      setMessage(
        "若此帳號仍需驗證，將收到新的驗證信，請檢查收件匣與垃圾郵件。",
      );
    } catch (issue) {
      setError(authMessage(issue));
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const client = getSupabase();
    if (!client) return;
    if ((mode === "signup" || mode === "reset") && password !== confirm) {
      setError("兩次輸入的密碼不同。");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const redirectTo = window.location.origin + "/";
      if (mode === "login") {
        const { error: issue } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (issue) throw issue;
      } else if (mode === "signup") {
        const { data, error: issue } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectTo },
        });
        if (issue) throw issue;
        if (!data.session) {
          setMode("login");
          setMessage(
            "若此 Email 可註冊，將收到驗證信；請完成驗證後登入。已有帳號可直接登入或重設密碼。",
          );
        }
      } else if (mode === "forgot") {
        const { error: issue } = await client.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo },
        );
        if (issue) throw issue;
        setMessage(
          "若此 Email 已註冊，將收到重設密碼的信件，請檢查收件匣與垃圾郵件。",
        );
      } else {
        const { error: issue } = await client.auth.updateUser({ password });
        if (issue) throw issue;
        setMessage("密碼已更新。");
        setMode("login");
      }
      setPassword("");
      setConfirm("");
    } catch (issue) {
      setError(authMessage(issue));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-story">
        <span className="auth-brand">
          toice<span>.</span>
        </span>
        <span className="eyebrow">YOUR DAILY TOEIC</span>
        <h1>
          換個裝置，
          <br />
          繼續你的進步。
        </h1>
        <p>
          900 個情境單字，從今天開始累積。登入同一帳號，手機與電腦都能接著學。
        </p>
        <div className="auth-feature">
          <Cloud size={23} />
          <span>
            單字進度、收藏與學習目標
            <br />
            <strong>一起儲存在你的帳號</strong>
          </span>
        </div>
      </section>
      <section className="auth-card panel">
        {loading ? (
          <p role="status">正在確認登入狀態…</p>
        ) : !configured ? (
          <>
            <Cloud size={32} />
            <h2>帳號服務準備中</h2>
            <p>
              網站尚未完成雲端帳號設定。設定完成後，即可註冊並開始新的學習計畫。
            </p>
            <p className="form-hint">
              此版本使用帳號進度，不會讀取原有的本機學習紀錄。
            </p>
          </>
        ) : (
          <>
            <span className="eyebrow">WELCOME TO YOUR STUDY SPACE</span>
            <h2>
              {
                {
                  login: "登入，繼續學習",
                  signup: "建立你的帳號",
                  forgot: "找回你的帳號",
                  reset: "設定新密碼",
                }[mode]
              }
            </h2>
            <p>
              {mode === "signup"
                ? "使用 Email 註冊，完成驗證後開始學習。"
                : mode === "reset"
                  ? "請輸入新的密碼。"
                  : "你的每一步，都記在同一個帳號。"}
            </p>
            <form onSubmit={submit}>
              <fieldset disabled={busy}>
                {mode !== "reset" && (
                  <label>
                    <span>
                      <Mail size={16} />
                      Email
                    </span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                )}
                {mode !== "forgot" && (
                  <label>
                    <span>
                      <LockKeyhole size={16} />
                      密碼
                    </span>
                    <input
                      type="password"
                      required
                      minLength={mode === "login" ? 1 : 8}
                      maxLength={128}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "login" ? "輸入密碼" : "至少 8 個字元"
                      }
                    />
                  </label>
                )}
                {(mode === "signup" || mode === "reset") && (
                  <label>
                    <span>確認密碼</span>
                    <input
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </label>
                )}
                <button
                  className="primary-btn full"
                  type="submit"
                  disabled={mode === "reset" && !session}
                >
                  {busy
                    ? "處理中…"
                    : {
                        login: "登入",
                        signup: "建立帳號",
                        forgot: "寄送重設密碼信",
                        reset: "儲存新密碼",
                      }[mode]}
                  <ArrowRight size={17} />
                </button>
              </fieldset>
            </form>
            {mode === "login" && (
              <div className="auth-links">
                <button onClick={() => switchMode("signup")} disabled={busy}>
                  還沒有帳號？免費註冊
                </button>
                <button onClick={() => switchMode("forgot")} disabled={busy}>
                  忘記密碼
                </button>
                <button
                  onClick={() => void resendConfirmation()}
                  disabled={busy}
                >
                  重寄驗證信
                </button>
              </div>
            )}
            {mode !== "login" && (
              <button
                className="text-btn"
                disabled={busy}
                onClick={() => switchMode("login")}
              >
                返回登入
              </button>
            )}
          </>
        )}
        {error && (
          <div role="alert" className="auth-error">
            {error}
            <button
              className="text-btn"
              onClick={() => {
                setError("");
                setBoot((n) => n + 1);
              }}
            >
              重新連線
            </button>
          </div>
        )}
        {message && (
          <p className="dialog-notice" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
