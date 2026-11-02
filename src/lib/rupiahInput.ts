// UI uses Indonesian grouping. Stored form state remains an ungrouped numeric string.
export function formatRupiahInput(raw:string|number):string {
 const value=String(raw);if(!/^\d*(\.\d{0,2})?$/.test(value))return value;
 const [whole,fraction]=value.split('.');
 return whole.replace(/\B(?=(\d{3})+(?!\d))/g,'.')+(fraction===undefined?'':','+fraction);
}
export function readRupiahInput(display:string):string {
 const value=display.replace(/^\s*Rp\s*/i,'').replace(/\s/g,'');
 if(!/^[\d.]*(,\d{0,2})?$/.test(value))return value;
 return value.replace(/\./g,'').replace(',','.').replace(/^0+(?=\d)/,'');
}
