export const expenseCategories = ['Medical', 'Hospital / Delivery', 'Baby Gear', 'Mother', 'Other'];
const labels: Record<string,string> = {
  Medical:'Kesehatan (kontrol, tes, obat)', 'Hospital / Delivery':'Rumah sakit & persalinan',
  'Baby Gear':'Kebutuhan anak', Mother:'Kebutuhan ibu', Other:'Lainnya',
  Travel:'Transportasi / perjalanan', Feeding:'Perlengkapan makan', Sleeping:'Perlengkapan tidur',
  'Baby clothing':'Pakaian bayi', Diapering:'Popok', Bathing:'Perlengkapan mandi', Safety:'Keamanan', 'Hospital bag':'Tas persalinan',
};
export const expenseCategoryLabel = (category?:string) => category ? labels[category] || category : 'Tanpa kategori';
