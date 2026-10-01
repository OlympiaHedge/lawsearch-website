import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function isRecruiter(){const user=await getChatGPTUser();const allow=(env as unknown as {ADMIN_EMAIL?:string}).ADMIN_EMAIL;return !!user&&!!allow&&user.email.toLowerCase()===allow.toLowerCase();}
