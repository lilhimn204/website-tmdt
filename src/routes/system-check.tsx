import { useState } from 'react';
import { isHealthResponse } from '../../shared/health';

type CheckState = 'idle' | 'loading' | 'success' | 'error';

export function meta() {
  return [{ title: 'Kiểm tra API | Website TMĐT' }];
}

export default function SystemCheck() {
  const [state, setState] = useState<CheckState>('idle');

  async function checkApi() {
    setState('loading');
    try {
      const response = await fetch('/api/v1/health', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok || !isHealthResponse(await response.json())) throw new Error('API unavailable');
      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="max-w-2xl" aria-labelledby="check-title">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-800">Kiểm tra local</p>
      <h1 id="check-title" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Frontend đã gọi được API chưa?</h1>
      <p className="mt-5 leading-7 text-slate-600">Phép kiểm tra này chỉ xác nhận Pages Functions có phản hồi. Supabase và các chức năng bán hàng chưa được kết nối.</p>
      <button type="button" onClick={() => { void checkApi(); }} disabled={state === 'loading'} className="mt-7 inline-flex min-h-12 items-center rounded-md bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900 disabled:cursor-wait disabled:opacity-60">{state === 'loading' ? 'Đang kiểm tra…' : 'Kiểm tra kết nối'}</button>
      <div className="mt-6 min-h-24 rounded-md border border-slate-200 bg-white p-5 leading-7" role="status" aria-live="polite" aria-atomic="true">
        {state === 'idle' && <p>Chưa thực hiện kiểm tra trong trình duyệt này.</p>}
        {state === 'loading' && <p>Đang chờ phản hồi từ API…</p>}
        {state === 'success' && <p className="text-teal-900">Kết nối thành công. API đang chạy; database chưa cấu hình.</p>}
        {state === 'error' && <p className="text-red-800">Chưa kết nối được API. Kiểm tra terminal đang chạy <code className="font-mono text-sm">npm run pages:dev</code>, rồi thử lại.</p>}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">Hướng dẫn mở terminal và chạy dự án nằm trong README.md.</p>
    </section>
  );
}
