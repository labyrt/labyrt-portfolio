export const config={runtime:'edge'};
export default async function handler(req){
  const url=new URL(req.url);
  const id=url.searchParams.get('id');
  if(!id||!/^[A-Za-z0-9_-]+$/.test(id)) return new Response('Invalid video id',{status:400});
  const upstream=`https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
  const requestHeaders=new Headers();
  const range=req.headers.get('range');
  if(range) requestHeaders.set('range',range);
  const source=await fetch(upstream,{headers:requestHeaders,redirect:'follow'});
  const headers=new Headers();
  for(const key of ['content-type','content-length','content-range','accept-ranges','etag','last-modified']){const value=source.headers.get(key);if(value)headers.set(key,value)}
  headers.set('cache-control','public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  headers.set('access-control-allow-origin','*');
  return new Response(source.body,{status:source.status,headers});
}
