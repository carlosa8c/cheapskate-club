export type Member = {handle:string;display_name:string;tokens:number;categories:Record<string,number>;share_models:boolean;models:{name:string;tokens:number}[];roles?:{name:string;tokens:number}[]};
export function memberData(value:unknown):Member|null {
 if(!value || typeof value!=="object") return null;
 const v=value as Member;
 if(typeof v.handle!=="string" || typeof v.display_name!=="string" || !Number.isSafeInteger(v.tokens) || v.tokens<0 || !v.categories || !Array.isArray(v.models)) return null;
 if(v.roles!==undefined && (!Array.isArray(v.roles) || v.roles.some(r=>typeof r.name!=="string"||!Number.isSafeInteger(r.tokens)||r.tokens<0))) return null;
 if(Object.values(v.categories).some(n=>!Number.isSafeInteger(n)||n<0) || v.models.some(m=>typeof m.name!=="string"||!Number.isSafeInteger(m.tokens)||m.tokens<0)) return null;
 return {...v,models:v.share_models?v.models:[],roles:v.roles||[]};
}
