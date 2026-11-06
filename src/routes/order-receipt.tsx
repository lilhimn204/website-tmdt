import { ReceiptPage } from '../components/receipt-page';
export function meta() { return [{ title: 'Trạng thái tiếp nhận đơn | Website TMĐT' }]; }
export default function OrderReceipt() { return <ReceiptPage kind="order" />; }
