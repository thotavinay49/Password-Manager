// src/pages/SettingsPage.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { changeUsername, changePassword } from "../services/userService";

import Sidebar from "../components/layout/Sidebar";
import { ThemeSwitch, NotificationSwitch } from "../components/ui/Switches";
import InputField from "../components/ui/InputField";
import PasswordField from "../components/ui/PasswordField";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";


const zones = [
  { id: "Asia/Kolkata",     label: "IST" },
  { id: "UTC",              label: "UTC" },
  { id: "America/New_York", label: "NY"  },
  { id: "Europe/London",    label: "LDN" },
  { id: "Asia/Tokyo",       label: "TYO" },
];

const formats = [
  { label: "HH:mm:ss",   opts:{ hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false } },
  { label: "hh:mm:ss A", opts:{ hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true  } },
  { label: "DD/MM HH:mm",opts:{ day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false } },
  { label: "ddd DD MMM", opts:{ weekday:"short",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false } },
  { label: "HH:mm:ss.S", opts:{ hour:"2-digit",minute:"2-digit",second:"2-digit",fractionalSecondDigits:1,hour12:false } },
];



export default function SettingsPage() {

  const { theme, choose }  = useTheme();
  const { user, setUser }  = useAuth();
  const { show, enabled, setEnabled } = useToast();
  const location           = useLocation();

 
  const baseBtnCls  = "w-full py-3 rounded-lg font-semibold transition disabled:opacity-50";
  const saveBtnCls  = `${baseBtnCls} ${choose(
    "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700",
    "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-400 hover:to-blue-500"
  )}`.trim();
  const aboutBtnCls = `${baseBtnCls} ${choose(
    "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
    "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500"
  )}`.trim();


  const [tzIndex, setTzIndex]   = useState(0);
  const [fmtIndex, setFmtIndex] = useState(0);
  const [time, setTime]         = useState("");

  useEffect(() => {
    const tick = () => {
      const zone = zones[tzIndex].id;
      const opts = formats[fmtIndex].opts;
      setTime(new Intl.DateTimeFormat("en-IN",{ timeZone:zone, ...opts }).format(new Date()));
    };
    tick();
    const id = setInterval(tick,1000);
    return () => clearInterval(id);
  }, [tzIndex, fmtIndex]);

 
  const toggleNotifications = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      show("Notifications enabled",3000,"info",true);
      const page = location.pathname === "/"
        ? "Dashboard"
        : location.pathname.slice(1).replace(/^\w/, c => c.toUpperCase());
      show(`Welcome to ${page} page, ${user?.username || "Guest"}`,4000,"info",true);
    }
  };

  const [newUsername, setNewUsername] = useState("");
  const [uMsg, setUMsg]               = useState(null);

  const [pwd, setPwd]   = useState({ current:"", password:"", confirm:"" });
  const [pMsg, setPMsg] = useState(null);

  
  const [confirm, setConfirm] = useState(null);   
  const [aboutOpen, setAboutOpen] = useState(false);

  
  const parseError = (err, fallback = "Error") => {
    const status  = err?.response?.status;
    const data    = err?.response?.data;

    let message =
      typeof data === "string" ? data :
      data?.message            ? data.message :
      data?.error              ? data.error :
      err?.message             ? err.message :      
      fallback;

    return status ? `${status}: ${message}` : message;
  };

  
  const patchUsername = async () => {
    try {
      const res    = await changeUsername(newUsername.trim());
      const status = res?.status ?? 200;

      if ([200,201,204].includes(status)) {
        setUser(u => (u ? { ...u, username:newUsername.trim() } : null));
        setUMsg({ ok:true, text:"Username updated" });
        setNewUsername("");
        return;
      }
      setUMsg({ ok:false, text:`${status}: Unexpected status` });
    } catch (err) {
      if (err?.response?.status === 204) {
        setUser(u => (u ? { ...u, username:newUsername.trim() } : null));
        setUMsg({ ok:true, text:"Username updated" });
        setNewUsername("");
      } else {
        setUMsg({ ok:false, text: parseError(err, err?.response?.status?.toString()) });
      }
    }
  };


  const patchPassword = async () => {
    if (pwd.password !== pwd.confirm) {
      setPMsg({ ok:false, text:"Passwords do not match" });
      return;
    }
    try {
      await changePassword(pwd.current, pwd.password);
      setPMsg({ ok:true, text:"Password changed" });
      setPwd({ current:"", password:"", confirm:"" });
    } catch (err) {
      setPMsg({ ok:false, text: parseError(err, err?.response?.status?.toString()) });
    }
  };


  const askUsernameSave = e => { e.preventDefault(); setConfirm("username"); };
  const askPasswordSave = e => { e.preventDefault(); setConfirm("password"); };
  const closeConfirm    = () => setConfirm(null);
  const proceedConfirm  = () => {
    confirm === "username" ? patchUsername() : patchPassword();
    setConfirm(null);
  };

  
  return (
    <div className={`min-h-screen ${choose("bg-gray-50","bg-gray-900")}`}>
      <Sidebar active="settings" />

      <div className="ml-64 p-8">
        <h1 className={`text-2xl font-bold mb-8 ${choose("text-gray-900","text-gray-100")}`}>Settings</h1>

        <div className={`border-b my-6 ${choose("border-gray-200","border-gray-700")}`} />

        {/* clock card */}
        <div className={`mb-8 p-6 rounded-xl shadow-sm space-y-4 w-full max-w-[28rem] ${choose("bg-white text-gray-800","bg-gray-800 text-gray-200")}`}>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setTzIndex(i => (i+1)%zones.length)}
              className={`px-2 py-1 rounded-md text-xs font-semibold ${choose("bg-gray-200 hover:bg-gray-300 text-gray-800","bg-gray-700 hover:bg-gray-600 text-gray-200")}`}
            >
              TZ: {zones[tzIndex].label}
            </button>
            <button
              onClick={() => setFmtIndex(i => (i+1)%formats.length)}
              className={`px-2 py-1 rounded-md text-xs font-semibold ${choose("bg-gray-200 hover:bg-gray-300 text-gray-800","bg-gray-700 hover:bg-gray-600 text-gray-200")}`}
            >
              FMT: {formats[fmtIndex].label}
            </button>
          </div>
          <p className="text-4xl font-mono tracking-widest select-none text-center">{time}</p>
        </div>

        {/* settings card */}
        <section className={`p-6 rounded-xl shadow-sm max-w-xl space-y-8 ${choose("bg-white","bg-gray-800")}`}>

          {/* appearance */}
          <h2 className={`text-lg font-semibold ${choose("text-gray-800","text-gray-200")}`}>Appearance</h2>
          <div className="flex items-center justify-between">
            <p className={choose("text-gray-700","text-gray-300")}>
              Mode: <span className="font-semibold capitalize">{theme}</span>
            </p>
            <ThemeSwitch />
          </div>

          {/* username */}
          <form onSubmit={askUsernameSave} className="space-y-4">
            <h3 className={`font-medium ${choose("text-gray-800","text-gray-200")}`}>Change username</h3>
            <InputField
              id="newUsername"
              label="New username"
              icon={null}
              value={newUsername}
              onChange={v => { setNewUsername(v); if (uMsg) setUMsg(null); }}
              placeholder="Enter new username"
            />
            {uMsg && <p className={uMsg.ok ? "text-green-600" : "text-red-600"}>{uMsg.text}</p>}
            <Button type="submit" disabled={!newUsername} className={saveBtnCls}>Save</Button>
          </form>

          <hr className={choose("border-gray-200","border-gray-700")} />

          {/* password */}
          <form onSubmit={askPasswordSave} className="space-y-4">
            <h3 className={`font-medium ${choose("text-gray-800","text-gray-200")}`}>Change password</h3>
            <PasswordField id="current" label="Current password" value={pwd.current}
              onChange={v => { setPwd({ ...pwd, current:v }); if (pMsg) setPMsg(null); }} />
            <PasswordField id="new" label="New password" value={pwd.password}
              onChange={v => { setPwd({ ...pwd, password:v }); if (pMsg) setPMsg(null); }} />
            <PasswordField id="confirm" label="Confirm new password" value={pwd.confirm}
              onChange={v => { setPwd({ ...pwd, confirm:v }); if (pMsg) setPMsg(null); }} />
            {pMsg && <p className={pMsg.ok ? "text-green-600" : "text-red-600"}>{pMsg.text}</p>}
            <Button type="submit" disabled={!pwd.current || !pwd.password || !pwd.confirm} className={saveBtnCls}>Save</Button>
          </form>
        </section>

        {/* notifications */}
        <div className={`mt-8 p-6 rounded-xl shadow-sm max-w-xl space-y-4 ${choose("bg-white","bg-gray-800")}`}>
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${choose("text-gray-800","text-gray-200")}`}>Notifications</h3>
            <NotificationSwitch checked={enabled} onToggle={toggleNotifications} />
          </div>
        </div>

        {/* about */}
        <div className={`mt-8 p-6 rounded-xl shadow-sm max-w-xl ${choose("bg-white","bg-gray-800")}`}>
          <Button onClick={() => setAboutOpen(true)} className={aboutBtnCls}>About this app</Button>
        </div>
      </div>

      {/* about modal */}
      <Modal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} panelClass={choose("bg-white","bg-gray-800")}>
        <h2 className={`text-2xl font-bold mb-4 ${choose("text-gray-800","text-gray-100")}`}>SecureVault</h2>
        <p className={choose("text-gray-700","text-gray-300")}>SecureVault is an open‑source password manager built with Spring Boot, React and Tailwind CSS.</p>
        <p className={choose("text-gray-700","text-gray-300")}>Your saved credentials are encrypted in the backend before being stored, and strong-password guidance is provided in real time.</p>
        <p className={choose("text-gray-700","text-gray-300")}>Version 1.0.0 • © 2025 SecureVault Team</p>
        <Button onClick={() => setAboutOpen(false)} className={`${baseBtnCls} bg-indigo-600 hover:bg-indigo-700 text-white mt-4`}>Close</Button>
      </Modal>

      {/* confirm modal */}
      <Modal isOpen={!!confirm} onClose={closeConfirm} panelClass={choose("bg-white","bg-gray-800")}>
        <p className={`mb-6 text-lg font-semibold ${choose("text-gray-800","text-gray-100")}`}>
          {confirm === "username" ? "Save new username?" : "Save new password?"}
        </p>
        <div className="flex justify-center gap-4">
          <Button
            onClick={closeConfirm}
            className={`${baseBtnCls} ${choose("bg-gray-200 hover:bg-gray-300 text-gray-900","bg-gray-700 hover:bg-gray-600 text-gray-100")}`}
          >
            Cancel
          </Button>
          <Button type="button" onClick={proceedConfirm} className={saveBtnCls}>Confirm</Button>
        </div>
      </Modal>
    </div>
  );
}
