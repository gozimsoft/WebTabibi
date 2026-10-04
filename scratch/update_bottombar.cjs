const fs = require('fs');

const filePath = 'D:/Github/Utopia_react/frontend/src/components/BottomBar.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the footer layout so the date badge takes the exact width of the sidebar (w-28)
const oldFooter = `  return (
    <footer className="h-14 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-slate-300 flex items-center justify-between px-2 select-none z-10">
      {/* Big Date and Clock Badge */}
      <div className="flex items-center space-x-3">
        <div className="bg-rose-500 text-white rounded-lg px-3 py-1 shadow flex flex-col items-center justify-center leading-tight">
          <div className="text-base font-black tracking-tight">{dayNumber}/{monthNumber}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider">{dayName}</div>
          <div className="text-[11px] font-digital font-bold text-rose-100 tracking-wider mt-0.5">{timeStr}</div>
        </div>`;

const newFooter = `  return (
    <footer className="h-14 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-slate-300 flex items-center justify-between pr-2 select-none z-10">
      {/* Big Date and Clock Badge - aligned with sidebar width (w-28) */}
      <div className="flex items-center space-x-3 h-full">
        <div className="w-28 h-full bg-rose-500 text-white shadow-sm flex flex-col items-center justify-center leading-tight shrink-0 border-r border-rose-600 select-none">
          <div className="text-base font-black tracking-tight">{dayNumber}/{monthNumber}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider">{dayName}</div>
          <div className="text-[11px] font-mono font-bold text-rose-100 tracking-wider mt-0.5">{timeStr}</div>
        </div>`;

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated BottomBar.jsx');
} else {
  console.error('Could not find oldFooter in BottomBar.jsx');
}
