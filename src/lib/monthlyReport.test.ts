import {createReportPdf} from './reportPdf';
import assert from 'node:assert/strict';
import {monthlyReport} from './monthlyReport';
import type {HouseholdSnapshot} from './householdRecords';
const s:HouseholdSnapshot={householdId:'h',householdName:'<script>alert(1)</script>',version:'v',totalBudget:1000,budgetConfigured:true,allocations:[],tasks:[{id:'t',householdId:'h',name:'Checklist tersimpan',category:'Other',status:'Completed',priority:'Medium'}],records:{expenses:[{id:'e',householdId:'h',title:'Pembelian bulan ini',category:'Medical',expenseDate:'2026-10-01',paidAmount:100,totalAmount:100,paymentStatus:'Paid',source:'shopping'},{id:'old',householdId:'h',title:'TRANSAKSI BULAN LAMA',category:'Other',expenseDate:'2026-09-01',paidAmount:200,totalAmount:200,paymentStatus:'Paid'}],shoppingItems:[],appointments:[{id:'a',householdId:'h',purpose:'Kontrol',doctor:'Dokter',hospital:'Klinik',appointmentDate:'2026-10-17',appointmentTime:'10:00'}],documents:[]}};
const html=monthlyReport(s,'2026-10',new Date('2026-10-04T12:00:00Z'));
assert.ok(html.includes('Pembelian bulan ini'));assert.ok(!html.includes('TRANSAKSI BULAN LAMA'));assert.ok(html.includes('Checklist tersimpan'));assert.ok(html.includes('Kontrol'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>alert'));assert.ok(html.includes('kondisi saat diunduh'));assert.ok(html.includes('100'));assert.ok(html.includes('Cetak / Simpan PDF'));assert.throws(()=>monthlyReport(s,'2026-13'));
console.log('PASS monthly report: month boundaries, expense source, complete sections, snapshot labels, HTML escaping and print controls');

const pdf=createReportPdf({title:'Oktober 2026',family:'Keluarga Uji',summary:['Pengeluaran Rp100.000'],sections:[{title:'Riwayat pengeluaran',caption:'Transaksi bulan terpilih',headers:['Tanggal','Uraian','Jumlah'],rows:Array.from({length:150},(_,i)=>['04 Okt 2026','Catatan '+i+' '.repeat(2)+'Kebutuhan keluarga dengan catatan panjang','Rp100.000'])}],footer:'Catatan tersimpan saat diunduh.'});
assert.ok(pdf.getNumberOfPages()>1);assert.ok(pdf.output().startsWith('%PDF-'));console.log('PASS direct PDF: valid PDF, multipage tables and page numbering');
