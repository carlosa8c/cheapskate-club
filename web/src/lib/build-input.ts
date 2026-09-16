export function buildInput(form: FormData) {
 const title=String(form.get("title")||"").trim(),description=String(form.get("description")||"").trim();
 if(title.length<3||title.length>100||description.length<10||description.length>3000) return null;
 const urls:Record<string,string>={};
 for(const key of ["screenshot_url","project_url","discussion_url"]){
  const value=String(form.get(key)||"").trim();
  if(value){try{const url=new URL(value);if(url.protocol!=="https:"||url.username||url.password||value.length>2000)return null;}catch{return null;}}
  if(key==="discussion_url"&&value&&!/^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+\/?$/.test(value))return null;
  urls[key]=value;
 }
 return {title,description,show_usage:form.get('show_usage')==='on',screenshot_url:urls.screenshot_url,project_url:urls.project_url,discussion_url:urls.discussion_url};
}
export function buildId(value:unknown):value is string{return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);}
