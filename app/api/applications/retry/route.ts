import {isRecruiter} from '@/lib/admin';
import {retryApplicationNotifications} from '@/lib/application-notifications';
export async function POST(request:Request){if(!await isRecruiter()||request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});return Response.json(await retryApplicationNotifications());}
