import React, { useState } from 'react';
import { Appointment } from '../../types/domain';
import { PipMascot } from '../mascot/PipMascot';
import { Clock, MapPin, Stethoscope, Plus } from 'lucide-react';
import { displayDate } from '../../lib/familyRecords';
import { RecordActions } from '../records/RecordEditor';
interface Props { appointments: Appointment[]; onAddAppointment: () => void; onEdit: (item: Appointment) => void; onDelete: (item: Appointment) => void; onScheduleAgain: (item: Appointment) => void; today?: string; }
export function appointmentGroups(appointments: Appointment[], today: string) {
  const compare = (a: Appointment,b: Appointment) => a.appointmentDate.localeCompare(b.appointmentDate) || (a.appointmentTime || '23:59').localeCompare(b.appointmentTime || '23:59') || a.id.localeCompare(b.id);
  return { upcoming: appointments.filter(a=>a.appointmentDate>=today).sort(compare), past: appointments.filter(a=>a.appointmentDate<today).sort((a,b)=>compare(b,a)) };
}
function jakartaDate() {const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(name:string)=>parts.find(p=>p.type===name)?.value;return get('year')+'-'+get('month')+'-'+get('day');}
export const AppointmentsView: React.FC<Props> = ({ appointments, onAddAppointment, onEdit, onDelete, onScheduleAgain, today=jakartaDate() }) => {
  const [tab,setTab]=useState<'upcoming'|'past'>('upcoming');
  const [limit,setLimit]=useState(10);
  const {upcoming,past}=appointmentGroups(appointments,today);
  const visible=tab==='upcoming'?upcoming:past.slice(0,limit);
  const monthTitle=(date:string)=>new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(date.slice(0,7)+'-01T12:00:00+07:00'));
  return <div className="space-y-4 px-4 pb-28 pt-2 max-w-4xl mx-auto">
    <section className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#F0ECE4] shadow-xs flex items-center justify-between gap-3"><div><span className="text-[10px] font-black uppercase tracking-wider text-[#6C4CF5] bg-[#EEE9FF] px-2.5 py-0.5 rounded-full">Jadwal Keluarga</span><h1 className="text-xl sm:text-2xl font-black text-[#292442] mt-1.5">Jadwal Kontrol Dokter</h1><p className="text-xs font-bold text-[#79738E] mt-0.5">{appointments.length} jadwal terdaftar</p></div><PipMascot mood="happy" size={60} /></section>
    <button onClick={onAddAppointment} className="w-full py-3.5 rounded-2xl bg-[#EEE9FF] text-[#6C4CF5] font-black text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" />Tambah Jadwal</button>
    <div role="tablist" aria-label="Daftar jadwal" className="flex gap-2">
      <button role="tab" aria-selected={tab==='upcoming'} aria-controls="appointment-list" onClick={()=>setTab('upcoming')} className={tab==='upcoming'?'rounded-full bg-[#34236B] text-white px-4 py-2 text-sm font-bold':'rounded-full bg-white border border-[#EBE6DC] px-4 py-2 text-sm font-bold'}>Mendatang ({upcoming.length})</button>
      <button role="tab" aria-selected={tab==='past'} aria-controls="appointment-list" onClick={()=>{setTab('past');setLimit(10);}} className={tab==='past'?'rounded-full bg-[#34236B] text-white px-4 py-2 text-sm font-bold':'rounded-full bg-white border border-[#EBE6DC] px-4 py-2 text-sm font-bold'}>Riwayat ({past.length})</button>
    </div>
    {tab==='past' && <p className="text-xs text-[#79738E]">Jadwal yang tanggalnya sudah lewat. Tidak berarti kontrol telah dilakukan.</p>}
    <div id="appointment-list" role="tabpanel" aria-label={tab==='upcoming'?'Jadwal mendatang':'Riwayat jadwal'} className="space-y-4">
      {!visible.length && <p className="p-5 bg-white rounded-[24px] text-sm text-[#79738E]">{appointments.length===0?'Belum ada jadwal kontrol.':tab==='upcoming'?'Belum ada jadwal mendatang.':'Belum ada riwayat jadwal.'}</p>}
      {visible.map((apt,index)=><React.Fragment key={apt.id}>
        {tab==='past' && (index===0 || visible[index-1].appointmentDate.slice(0,7)!==apt.appointmentDate.slice(0,7)) && <h2 className="text-sm font-black text-[#79738E] pt-2">{monthTitle(apt.appointmentDate)}</h2>}
        <article className="bg-white rounded-[24px] p-5 border border-[#F0ECE4] shadow-xs">
          <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3 min-w-0"><div className="w-12 h-12 rounded-2xl bg-[#E7FAF5] text-[#1EA896] flex items-center justify-center shrink-0"><Stethoscope className="w-6 h-6" /></div><div className="min-w-0">
            {apt.appointmentDate===today && <span className="mb-2 block w-fit rounded-full bg-[#FFF8DE] px-2 py-1 text-[10px] font-black text-[#8A6300]">Hari ini</span>}
            <span className="text-xs font-black text-[#1EA896] bg-[#E7FAF5] px-2.5 py-1 rounded-full inline-flex flex-wrap items-center gap-1"><Clock className="w-3.5 h-3.5" />{displayDate(apt.appointmentDate)}{apt.appointmentTime && ' • '+apt.appointmentTime}</span>
            <h3 className="text-base font-black text-[#292442] mt-2 break-words">{apt.purpose}</h3>{apt.doctor && <p className="text-xs font-bold text-[#6C4CF5] mt-1">{apt.doctor}</p>}{apt.hospital && <p className="text-xs font-semibold text-[#79738E] mt-1 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" />{apt.hospital}</p>}
          </div></div><RecordActions onEdit={()=>onEdit(apt)} onDelete={()=>onDelete(apt)} /></div>
          {apt.notes && (apt.notes.length>140 || apt.notes.split('\n').length>2 ? <details className="mt-3 text-xs text-[#5A556B] bg-[#FCFBF8] p-3 rounded-xl border border-[#F0ECE4]"><summary className="cursor-pointer font-semibold"><span className="line-clamp-2">{apt.notes.slice(0,140)}…</span><span className="mt-1 block font-bold text-[#6C4CF5]">Lihat catatan</span></summary><p className="mt-2 whitespace-pre-wrap break-words">{apt.notes}</p></details> : <p className="mt-3 text-xs font-semibold text-[#5A556B] bg-[#FCFBF8] p-3 rounded-xl border border-[#F0ECE4] whitespace-pre-wrap break-words">{apt.notes}</p>)}
          <button type="button" onClick={()=>onScheduleAgain(apt)} className="mt-3 rounded-xl bg-[#EEE9FF] px-4 py-2 text-xs font-black text-[#6C4CF5]">Jadwalkan Lagi</button>
        </article>
      </React.Fragment>)}
      {tab==='past' && past.length>limit && <button onClick={()=>setLimit(value=>value+10)} className="w-full rounded-xl bg-[#EEE9FF] py-3 text-sm font-bold text-[#6C4CF5]">Lihat lebih banyak</button>}
    </div>
  </div>;
};
