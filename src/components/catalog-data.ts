import { previewNavigation } from './navigation-data';

export type Family = 'ups' | 'printer' | 'ram' | 'ssd' | 'mainboard' | 'psu' | 'case' | 'cooler' | 'network';
export type SpecValue = string | number | boolean | null;
export interface SpecDefinition { key: string; label: string; group: string; unit?: string; filter?: 'choice' | 'range' }
export interface DemoVariant {
  sku: string; label: string; published: boolean; lifecycle: 'active' | 'eol';
  price: number | null; stock: number | null; quoteOnly: boolean;
  warrantyMonths: number | null; specs: Record<string, SpecValue>;
}
export interface DemoProduct {
  slug: string; name: string; model: string; brand: string; category: string;
  family: Family; published: boolean; description: string;
  images: readonly { src: string; alt: string }[];
  documents: readonly { title: string; href: string }[];
  related: readonly string[]; variants: readonly DemoVariant[];
}
export interface CatalogItem { product: DemoProduct; variant: DemoVariant }
export const demoBrands = [{ slug: 'nhan-mau-a', name: 'Nhãn mẫu A' }, { slug: 'nhan-mau-b', name: 'Nhãn mẫu B' }] as const;

export const specDefinitions: Record<Family, readonly SpecDefinition[]> = {
  ups: [
    { key: 'cong-nghe', label: 'Công nghệ', group: 'Điện', filter: 'choice' },
    { key: 'va', label: 'Công suất biểu kiến', group: 'Điện', unit: 'VA', filter: 'range' },
    { key: 'cong-suat-w', label: 'Công suất thực', group: 'Điện', unit: 'W', filter: 'range' },
    { key: 'so-pha', label: 'Số pha', group: 'Điện', filter: 'choice' },
    { key: 'dang-lap', label: 'Dạng lắp', group: 'Lắp đặt', filter: 'choice' },
    { key: 'runtime', label: 'Thời gian lưu điện', group: 'Lưu điện', unit: 'phút' },
  ],
  printer: [
    { key: 'chuc-nang', label: 'Chức năng', group: 'In ấn', filter: 'choice' },
    { key: 'mau-in', label: 'Màu in', group: 'In ấn', filter: 'choice' },
    { key: 'toc-do', label: 'Tốc độ in', group: 'In ấn', unit: 'trang/phút', filter: 'range' },
    { key: 'dao-mat', label: 'Đảo mặt tự động', group: 'In ấn', filter: 'choice' },
    { key: 'wifi', label: 'Wi-Fi', group: 'Kết nối', filter: 'choice' },
    { key: 'lan', label: 'LAN', group: 'Kết nối', filter: 'choice' },
  ],
  ram: [
    { key: 'dung-luong-gb', label: 'Dung lượng', group: 'Bộ nhớ', unit: 'GB', filter: 'choice' },
    { key: 'ddr', label: 'Chuẩn DDR', group: 'Bộ nhớ', filter: 'choice' },
    { key: 'form-factor', label: 'Kiểu thanh', group: 'Lắp đặt', filter: 'choice' },
    { key: 'toc-do', label: 'Tốc độ', group: 'Bộ nhớ', unit: 'MT/s', filter: 'range' },
  ],
  ssd: [
    { key: 'dung-luong-gb', label: 'Dung lượng', group: 'Lưu trữ', unit: 'GB', filter: 'choice' },
    { key: 'giao-tiep', label: 'Giao tiếp', group: 'Lưu trữ', filter: 'choice' },
    { key: 'form-factor', label: 'Kích thước chuẩn', group: 'Lắp đặt', filter: 'choice' },
    { key: 'pcie', label: 'Thế hệ PCIe', group: 'Lưu trữ', filter: 'choice' },
  ],
  mainboard: [
    { key: 'socket', label: 'Socket', group: 'Tương thích', filter: 'choice' },
    { key: 'chipset', label: 'Chipset', group: 'Cấu hình', filter: 'choice' },
    { key: 'ddr', label: 'Chuẩn DDR', group: 'Bộ nhớ', filter: 'choice' },
    { key: 'form-factor', label: 'Kích thước chuẩn', group: 'Lắp đặt', filter: 'choice' },
  ],
  psu: [
    { key: 'cong-suat-w', label: 'Công suất', group: 'Điện', unit: 'W', filter: 'range' },
    { key: 'form-factor', label: 'Kích thước chuẩn', group: 'Lắp đặt', filter: 'choice' },
    { key: 'dau-noi', label: 'Đầu nối', group: 'Kết nối', filter: 'choice' },
  ],
  case: [
    { key: 'mainboard', label: 'Chuẩn mainboard', group: 'Lắp đặt', filter: 'choice' },
    { key: 'gpu-mm', label: 'Khoảng trống GPU', group: 'Lắp đặt', unit: 'mm', filter: 'range' },
    { key: 'tan-mm', label: 'Chiều cao tản tối đa', group: 'Lắp đặt', unit: 'mm', filter: 'range' },
  ],
  cooler: [
    { key: 'loai-tan', label: 'Loại tản', group: 'Tản nhiệt', filter: 'choice' },
    { key: 'socket', label: 'Socket', group: 'Lắp đặt', filter: 'choice' },
    { key: 'cao-mm', label: 'Chiều cao', group: 'Lắp đặt', unit: 'mm', filter: 'range' },
  ],
  network: [
    { key: 'cong', label: 'Số cổng', group: 'Kết nối', filter: 'range' },
    { key: 'toc-do', label: 'Tốc độ cổng', group: 'Kết nối', unit: 'Mbps', filter: 'choice' },
    { key: 'poe', label: 'Hỗ trợ PoE', group: 'Nguồn', filter: 'choice' },
    { key: 'poe-w', label: 'Ngân sách PoE', group: 'Nguồn', unit: 'W', filter: 'range' },
  ],
};

export const familyLabels: Record<Family, string> = { ups: 'UPS', printer: 'Máy in', ram: 'RAM', ssd: 'SSD', mainboard: 'Mainboard', psu: 'Nguồn máy tính', case: 'Case', cooler: 'Tản nhiệt', network: 'Switch mạng' };
const categoryFamilies: Record<string, Family> = {
  'ups-line-interactive': 'ups', 'ups-online-mot-pha': 'ups', 'ups-online-ba-pha': 'ups', ips: 'ups',
  'may-in-don-nang': 'printer', 'may-in-da-nang': 'printer', ram: 'ram', ssd: 'ssd', mainboard: 'mainboard',
  'nguon-may-tinh': 'psu', 'case-may-tinh': 'case', 'tan-nhiet-khi': 'cooler', 'tan-nhiet-aio': 'cooler',
  'switch-cong-nghiep': 'network', 'switch-poe-cong-nghiep': 'network',
};
export const catalogCategories = previewNavigation.status === 'ready' ? previewNavigation.groups.flatMap((group) => [
  { slug: group.to.split('/')[2]!, label: group.label, parent: null as string | null, icon: group.id, family: null as Family | null },
  ...group.children.map((child) => ({ slug: child.to.split('/')[2]!, label: child.label, parent: group.to.split('/')[2]!, icon: group.id, family: categoryFamilies[child.to.split('/')[2]!] ?? null })),
]) : [];

function variant(sku: string, label: string, price: number | null, specs: Record<string, SpecValue>, extra: Partial<DemoVariant> = {}): DemoVariant {
  return { sku, label, price, specs, published: true, lifecycle: 'active', stock: 5, quoteOnly: false, warrantyMonths: 12, ...extra };
}
const demoImages = [
  { src: '/demo-device-front.svg', alt: 'Sơ đồ minh họa thiết bị nhìn từ trước, không phải ảnh sản phẩm thật' },
  { src: '/demo-device-back.svg', alt: 'Sơ đồ minh họa thiết bị nhìn từ sau, không phải ảnh sản phẩm thật' },
];
function product(slug: string, name: string, model: string, family: Family, category: string, variants: DemoVariant[], extra: Partial<DemoProduct> = {}): DemoProduct {
  return { slug, name, model, family, category, variants, brand: 'Nhãn mẫu A', published: true, description: 'Thiết bị giả định để thử tìm kiếm, thông số, so sánh và giỏ hàng. Không dùng thông tin này để chọn mua hoặc triển khai thiết bị thực.', images: [], documents: [], related: [], ...extra };
}

// DEMO ONLY: every price, stock level, warranty and attribute here is synthetic.
// No real supplier, brand, price or distribution right is inferred.
export const demoProducts: readonly DemoProduct[] = [
  product('ups-demo-1000', 'UPS Online mẫu 1000', 'DEMO-U1000', 'ups', 'ups-online-mot-pha', [
    variant('DEMO-U1000-T', 'Tower', 100000, { 'cong-nghe': 'Online', va: 1000, 'cong-suat-w': 900, 'so-pha': '1 pha', 'dang-lap': 'Tower', runtime: null }),
    variant('DEMO-U1000-R', 'Rack', 120000, { 'cong-nghe': 'Online', va: 1000, 'cong-suat-w': 900, 'so-pha': '1 pha', 'dang-lap': 'Rack', runtime: null }, { warrantyMonths: 24 }),
  ], { images: demoImages, documents: [{ title: 'Ghi chú về bộ dữ liệu DEMO (TXT)', href: '/demo-catalog-notes.txt' }], related: ['ups-demo-1500', 'ups-demo-2000'] }),
  product('ups-demo-1500', 'UPS Online mẫu 1500', 'DEMO-U1500', 'ups', 'ups-online-mot-pha', [variant('DEMO-U1500-T', 'Tower', 150000, { 'cong-nghe': 'Online', va: 1500, 'cong-suat-w': 1350, 'so-pha': '1 pha', 'dang-lap': 'Tower', runtime: null })]),
  product('ups-demo-2000', 'UPS Online mẫu 2000', 'DEMO-U2000', 'ups', 'ups-online-mot-pha', [variant('DEMO-U2000-T', 'Tower', 200000, { 'cong-nghe': 'Online', va: 2000, 'cong-suat-w': null, 'so-pha': '1 pha', 'dang-lap': 'Tower', runtime: null })], { brand: 'Nhãn mẫu B' }),
  product('ups-demo-eol', 'UPS mẫu đã ngừng sản xuất', 'DEMO-UOLD', 'ups', 'ups-line-interactive', [variant('DEMO-UOLD-T', 'Tower', 90000, { 'cong-nghe': 'Line Interactive', va: 750, 'cong-suat-w': 450, 'so-pha': '1 pha', 'dang-lap': 'Tower', runtime: null }, { lifecycle: 'eol' })]),
  product('may-in-demo-laser', 'Máy in laser mẫu', 'DEMO-P100', 'printer', 'may-in-don-nang', [variant('DEMO-P100', 'Đơn sắc', 110000, { 'chuc-nang': 'Đơn năng', 'mau-in': 'Đơn sắc', 'toc-do': 30, 'dao-mat': true, wifi: false, lan: true })]),
  product('may-in-demo-multi', 'Máy in đa năng mẫu', 'DEMO-P200', 'printer', 'may-in-da-nang', [variant('DEMO-P200', 'Đơn sắc', null, { 'chuc-nang': 'Đa năng', 'mau-in': 'Đơn sắc', 'toc-do': null, 'dao-mat': false, wifi: null, lan: true })], { brand: 'Nhãn mẫu B' }),
  product('ram-demo-ddr4', 'RAM DDR4 mẫu', 'DEMO-R4', 'ram', 'ram', [
    variant('DEMO-R4-8', '8 GB', 80000, { 'dung-luong-gb': 8, ddr: 'DDR4', 'form-factor': 'DIMM', 'toc-do': 3200 }),
    variant('DEMO-R4-16', '16 GB', 160000, { 'dung-luong-gb': 16, ddr: 'DDR4', 'form-factor': 'DIMM', 'toc-do': 3200 }),
  ], { related: ['ram-demo-ddr5'] }),
  product('ram-demo-ddr5', 'RAM DDR5 mẫu', 'DEMO-R5', 'ram', 'ram', [variant('DEMO-R5-16', '16 GB', 180000, { 'dung-luong-gb': 16, ddr: 'DDR5', 'form-factor': 'DIMM', 'toc-do': 5600 })], { brand: 'Nhãn mẫu B' }),
  product('ssd-demo-nvme', 'Ổ SSD NVMe mẫu', 'DEMO-SN', 'ssd', 'ssd', [
    variant('DEMO-SN-512', '512 GB', 90000, { 'dung-luong-gb': 512, 'giao-tiep': 'NVMe', 'form-factor': 'M.2 2280', pcie: 'PCIe 3.0' }),
    variant('DEMO-SN-1024', '1 TB', 170000, { 'dung-luong-gb': 1024, 'giao-tiep': 'NVMe', 'form-factor': 'M.2 2280', pcie: 'PCIe 4.0' }),
  ], { related: ['ssd-demo-sata'] }),
  product('ssd-demo-sata', 'Ổ SSD SATA mẫu', 'DEMO-SS', 'ssd', 'ssd', [variant('DEMO-SS-512', '512 GB', 70000, { 'dung-luong-gb': 512, 'giao-tiep': 'SATA', 'form-factor': '2.5 inch', pcie: 'not-applicable' })]),
  product('nguon-demo', 'Nguồn máy tính mẫu', 'DEMO-PSU', 'psu', 'nguon-may-tinh', [variant('DEMO-PSU-650', '650 W', 130000, { 'cong-suat-w': 650, 'form-factor': 'ATX', 'dau-noi': '24-pin' }, { stock: null })]),
  product('case-demo', 'Case máy tính mẫu', 'DEMO-CASE', 'case', 'case-may-tinh', [variant('DEMO-CASE-01', 'Đen', 60000, { mainboard: 'ATX', 'gpu-mm': 320, 'tan-mm': 160 }, { stock: 0 })]),
  product('tan-nhiet-demo', 'Tản nhiệt khí mẫu', 'DEMO-COOL', 'cooler', 'tan-nhiet-khi', [variant('DEMO-COOL-01', 'Tháp đơn', 50000, { 'loai-tan': 'Khí', socket: null, 'cao-mm': 155 }, { quoteOnly: true })]),
  product('switch-demo', 'Switch công nghiệp mẫu', 'DEMO-N8', 'network', 'switch-cong-nghiep', [variant('DEMO-N8', '8 cổng', 140000, { cong: 8, 'toc-do': 1000, poe: false, 'poe-w': 0 })]),
  product('switch-poe-demo', 'Switch PoE mẫu', 'DEMO-NP8', 'network', 'switch-poe-cong-nghiep', [variant('DEMO-NP8', '8 cổng PoE', 210000, { cong: 8, 'toc-do': 1000, poe: true, 'poe-w': 120 }, { warrantyMonths: null })], { brand: 'Nhãn mẫu B' }),
];

export function catalogItems(products: readonly DemoProduct[] = demoProducts): CatalogItem[] {
  return products.filter((entry) => entry.published).flatMap((entry) => entry.variants.filter((sku) => sku.published).map((sku) => ({ product: entry, variant: sku })));
}
export function findItem(sku: string, products: readonly DemoProduct[] = demoProducts) { return catalogItems(products).find((item) => item.variant.sku === sku); }
export function productHref(item: CatalogItem) { return `/san-pham/${item.product.slug}/?sku=${encodeURIComponent(item.variant.sku)}`; }
export function categoryIconId(slug: string) { return catalogCategories.find((category) => category.slug === slug)?.icon ?? 'components'; }
