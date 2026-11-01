import React from 'react';
import type {LocalAttachment} from '../../types/domain';
import {AttachmentPicker} from './RecordEditor';
export function ExtraAttachments({value=[],onChange}:{value?:LocalAttachment[];onChange:(files:LocalAttachment[])=>void}){return <div className="space-y-3 rounded-xl border border-[#E9E4DC] p-3"><p className="text-xs font-bold">Lampiran tambahan (opsional, maksimal 2)</p>{value.map((file,i)=><AttachmentPicker key={file.id} value={file} onChange={next=>onChange(next?value.map((old,n)=>n===i?next:old):value.filter((_,n)=>n!==i))}/>)}{value.length<2&&<AttachmentPicker key={'new-'+value.length} onChange={file=>{if(file)onChange([...value,file]);}}/>}</div>;}
