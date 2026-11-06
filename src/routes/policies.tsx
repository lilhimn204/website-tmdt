import { useParams } from 'react-router';
import { InformationPage, PolicyIndex } from '../components/information-page';
import { findInformation } from '../components/information-data';
export function meta({ params }: { params: { policy?: string } }) { return [{ title: `${params.policy ? findInformation(`/chinh-sach/${params.policy}/`)?.title ?? 'Không tìm thấy chính sách' : 'Chính sách'} | Website TMĐT` }]; }
export default function Policies() { const { policy } = useParams(); return policy ? <InformationPage path={`/chinh-sach/${policy}/`} /> : <PolicyIndex />; }
