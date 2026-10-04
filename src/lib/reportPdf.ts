import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
export interface PdfReport { title:string;family:string;summary:string[];sections:Array<{title:string;caption:string;headers:string[];rows:string[][]}>;footer:string }
export function createReportPdf(report:PdfReport) {
  const doc=new jsPDF();let y=18;const width=182;
  doc.setFillColor(52,35,107);doc.roundedRect(14,y,width,39,4,4,'F');doc.setTextColor(255,255,255);doc.setFontSize(10);doc.text('LITTLE JOURNEY / LAPORAN BULANAN',20,y+9);doc.setFontSize(20);doc.text(report.title,20,y+20);doc.setFontSize(10);doc.text(doc.splitTextToSize(report.family,168),20,y+29);y+=48;
  const paragraph=(text:string,size=9,color:[number,number,number]=[113,107,130])=>{doc.setTextColor(...color);doc.setFontSize(size);const lines=doc.splitTextToSize(text,width);if(y+lines.length*4>275){doc.addPage();y=18;}doc.text(lines,14,y);y+=lines.length*4+4;};
  paragraph(report.summary.join('   |   '),11,[52,35,107]);
  for(const section of report.sections){if(y>235){doc.addPage();y=18;}paragraph(section.title,13,[41,36,66]);paragraph(section.caption);if(!section.rows.length){paragraph('Tidak ada catatan.');continue;}
    autoTable(doc,{startY:y,head:[section.headers],body:section.rows,margin:{left:14,right:14,top:18,bottom:18},styles:{fontSize:8,cellPadding:3,overflow:'linebreak',textColor:[41,36,66]},headStyles:{fillColor:[108,76,245],textColor:255},alternateRowStyles:{fillColor:[248,247,252]},rowPageBreak:'avoid'});
    y=(doc as jsPDF & {lastAutoTable:{finalY:number}}).lastAutoTable.finalY+12;
  }
  paragraph(report.footer,8);
  const count=doc.getNumberOfPages();for(let n=1;n<=count;n++){doc.setPage(n);doc.setTextColor(113,107,130);doc.setFontSize(8);doc.text('Little Journey  /  '+n+' dari '+count,14,289);}
  return doc;
}
export function pdfFromReportHtml(html:string){const root=new DOMParser().parseFromString(html,'text/html');const text=(selector:string)=>root.querySelector(selector)?.textContent || '';return createReportPdf({title:text('h1'),family:text('header div'),summary:[...root.querySelectorAll('.summary div')].map(n=>n.textContent || ''),sections:[...root.querySelectorAll('section')].map(s=>({title:s.querySelector('h2')?.textContent || '',caption:s.querySelector('.caption')?.textContent || '',headers:[...s.querySelectorAll('th')].map(n=>n.textContent || ''),rows:[...s.querySelectorAll('tbody tr')].map(row=>[...row.querySelectorAll('td')].map(n=>n.textContent || ''))})),footer:text('footer')});}
