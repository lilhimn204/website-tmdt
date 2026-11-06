import { ReceiptPage } from '../components/receipt-page';
export function meta() { return [{ title: 'Theo dõi đơn hàng | Website TMĐT' }]; }
export default function OrderTracking() { return <ReceiptPage kind="tracking" />; }
