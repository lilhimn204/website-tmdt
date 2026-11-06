import { Link, useParams } from 'react-router';
import { demoBrands } from '../components/catalog-data';
import { CatalogPage } from '../components/catalog-page';
export function meta({ params }: { params: { brand?: string } }) { return [{ title: `${demoBrands.find((brand) => brand.slug === params.brand)?.name ?? 'Thương hiệu'} | Website TMĐT` }]; }
export default function Brands() {
  const { brand } = useParams();
  if (brand) return <CatalogPage mode="brand" />;
  return <><h1 className="mb-4 text-3xl font-semibold">Thương hiệu trong bản DEMO</h1><p className="mb-8 max-w-3xl leading-8 text-muted">Hai nhãn giả định dưới đây dùng để thử duyệt và lọc sản phẩm. Chưa có danh sách thương hiệu kinh doanh hoặc quyền phân phối được xác nhận; không dùng logo hãng thật.</p><ul className="grid gap-4 sm:grid-cols-2">{demoBrands.map((entry) => <li key={entry.slug}><Link to={`/thuong-hieu/${entry.slug}/`} className="block rounded-xl border border-line bg-surface p-6 hover:border-brand"><h2 className="text-xl font-semibold text-brand">{entry.name}</h2><p className="mt-3 text-sm text-muted">Xem sản phẩm kiểm thử theo nhãn</p></Link></li>)}</ul></>;
}
