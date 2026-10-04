export const categories=['한식','양식','일식','중식','카페·디저트','여행지','숙소','기타'];
export const defaultProfile={title:'맛있는 여행의 기록',subtitle:'맛있었던 한 끼와, 그날의 여행을 함께.'};
const str=(v,max=3000)=>typeof v==='string'?v.slice(0,max):'';
export function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.href:'';}catch{return '';}}
export function safePhoto(value){return typeof value==='string'&&value.length<=600000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)?value:'';}
export function cleanRecord(v){
 if(!v||typeof v!=='object'||typeof v.id!=='string'||!v.id||v.id.length>100||!str(v.name,80).trim())throw Error('장소 이름이나 기록 형식이 올바르지 않아요.');
 const date=str(v.visitDate,10);if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('방문일 형식이 올바르지 않아요.');
 return {id:v.id,name:str(v.name,80).trim(),area:str(v.area,80).trim(),category:categories.includes(v.category)?v.category:'기타',status:v.status==='wishlist'?'wishlist':'visited',visitDate:date,rating:Math.min(5,Math.max(0,Math.floor(Number(v.rating)||0))),menu:str(v.menu,160),note:str(v.note),mapUrl:safeUrl(v.mapUrl),photo:safePhoto(v.photo),trip:str(v.trip,80).trim(),day:Math.min(365,Math.max(1,Math.floor(Number(v.day)||1))),order:Math.min(999,Math.max(1,Math.floor(Number(v.order)||1))),favorite:v.favorite===true,published:v.published===true,createdAt:str(v.createdAt,30)||new Date().toISOString(),updatedAt:str(v.updatedAt,30)||new Date().toISOString()};
}
export function cleanProfile(v){return {title:str(v?.title,35).trim()||defaultProfile.title,subtitle:str(v?.subtitle,120)};}
export function parseJournal(value){
 if(!value||value.version!==1||!Array.isArray(value.records)||value.records.length>2000)throw Error('지원하지 않는 기록 파일이에요. 한 입의 기억에서 내보낸 파일을 선택해 주세요.');
 const records=value.records.map(cleanRecord);if(new Set(records.map(r=>r.id)).size!==records.length)throw Error('파일에 중복된 기록 번호가 있어요.');
 return {version:1,profile:cleanProfile(value.profile||defaultProfile),records};
}
export function publicJournal(journal){return {version:1,profile:cleanProfile(journal.profile),publishedAt:new Date().toISOString(),records:journal.records.filter(r=>r.published===true).map(cleanRecord)};}
export function mergeRecords(existing,incoming){const map=new Map(existing.map(r=>[r.id,r]));for(const r of incoming){const old=map.get(r.id);if(!old||r.updatedAt>old.updatedAt)map.set(r.id,r);}return [...map.values()];}
export function courses(records){const groups=new Map();for(const r of records){if(!r.trip)continue;if(!groups.has(r.trip))groups.set(r.trip,[]);groups.get(r.trip).push(r);}return [...groups].map(([name,stops])=>({name,stops:stops.sort((a,b)=>a.day-b.day||a.order-b.order||a.createdAt.localeCompare(b.createdAt))}));}
export function mapLink(record){return safeUrl(record.mapUrl)||'https://map.naver.com/p/search/'+encodeURIComponent([record.area,record.name].filter(Boolean).join(' '));}
export function pageUrl(repository){const [owner,repo]=repository.split('/');return 'https://'+owner.toLowerCase()+'.github.io/'+(repo.toLowerCase()===owner.toLowerCase()+'.github.io'?'':encodeURIComponent(repo)+'/');}
