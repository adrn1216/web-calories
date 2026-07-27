import { Settings } from "lucide-react";

type Props = { consumed: number; target: number; earnedToday: number; weeklyBalance: number; onSettings: () => void; onEarnedCalories: () => void };

export function CalorieHeader({ consumed, target, earnedToday, weeklyBalance, onSettings, onEarnedCalories }: Props) {
  const remaining = target - consumed;
  return (
    <header className="shrink-0 px-5 pb-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <div><p className="text-xs font-medium uppercase tracking-[.16em] text-black/45">Daily balance</p><p className="mt-1 text-base font-medium">Today</p></div>
        <button type="button" onClick={onSettings} aria-label="Open settings" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-black/5"><Settings size={20} strokeWidth={1.7} /></button>
      </div>
      <div className="py-4 text-center">
        <p className="text-5xl font-semibold tracking-[-.06em]">{remaining.toLocaleString()}</p>
        <p className="mt-1.5 text-xs text-black/50">calories remaining today</p>
      </div>
      <div className="grid grid-cols-3 divide-x divide-black/10 border-y border-black/10 py-2.5 text-center">
        <Stat value={consumed} label="Consumed" />
        <Stat value={earnedToday} label="Earned today" signed={earnedToday > 0} onClick={onEarnedCalories} />
        <Stat value={weeklyBalance} label="For Cheat Day" signed tone={weeklyBalance > 0 ? "positive" : weeklyBalance < 0 ? "negative" : undefined} />
      </div>
    </header>
  );
}

function Stat({ value, label, signed = false, tone, onClick }: { value: number; label: string; signed?: boolean; tone?: "positive" | "negative"; onClick?: () => void }) {
  const formatted = `${signed && value > 0 ? "+" : ""}${value.toLocaleString()}`;
  const color = tone === "positive" ? "text-green-600" : tone === "negative" ? "text-red-600" : "";
  const content = <><p className={`text-lg font-semibold tracking-tight ${color}`}>{formatted}</p><p className="mt-1 text-[11px] text-black/45">{label}</p></>;
  return onClick ? <button type="button" onClick={onClick} className="min-h-11 px-1 hover:bg-black/[.03]" aria-label="Add earned calories">{content}</button> : <div className="px-1">{content}</div>;
}
