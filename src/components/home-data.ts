import { previewNavigation, type CategoryGroup } from './navigation-data';

export type HomeListState<T> =
  | { status: 'ready'; items: readonly T[] }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void };

export interface HomeCategory extends CategoryGroup {
  description: string;
  guidance: string;
  questions: readonly string[];
}

export interface PreviewProduct {
  id: string;
  name: string;
  model: string;
  sku: string;
  category: string;
  categoryId: string;
  specifications: readonly { label: string; value: string | null }[];
}

export interface ReferenceBrand { name: string; category: string }

const categoryCopy: Record<string, Pick<HomeCategory, 'description' | 'guidance' | 'questions'>> = {
  power: {
    description: 'UPS, giải pháp lưu điện',
    guidance: 'Bắt đầu từ tải thực tế và thời gian cần duy trì.',
    questions: ['Thiết bị nào cần lưu điện và tổng công suất tải là bao nhiêu?', 'Cần duy trì trong bao lâu? VA không thay thế cho W hoặc thời gian lưu điện.'],
  },
  printing: {
    description: 'Máy in, nhu cầu văn phòng',
    guidance: 'Chọn theo khối lượng in và chi phí sử dụng.',
    questions: ['Cần in, scan hay copy; in màu hay đơn sắc?', 'Số trang mỗi tháng, kết nối, đảo mặt và vật tư thay thế cần được đối chiếu.'],
  },
  components: {
    description: 'RAM, SSD, case và tản nhiệt',
    guidance: 'Đối chiếu cấu hình trước khi nâng cấp.',
    questions: ['Ghi lại model máy hoặc mainboard, chuẩn RAM và giao tiếp ổ lưu trữ.', 'Với case, nguồn và tản nhiệt: kiểm tra kích thước, socket, đầu nối và khoảng trống lắp đặt.'],
  },
  network: {
    description: 'Kết nối, mạng công nghiệp',
    guidance: 'Xác định môi trường và quy mô triển khai.',
    questions: ['Cần bao nhiêu cổng, loại kết nối và tốc độ nào?', 'Nếu cần PoE, kiểm tra tổng công suất; đối chiếu điều kiện môi trường với tài liệu thiết bị.'],
  },
};

// Reuse the sitemap taxonomy. This remains a preview, not a published catalog.
export const homeCategories: readonly HomeCategory[] = previewNavigation.status === 'ready'
  ? previewNavigation.groups.flatMap((group) => {
    const copy = categoryCopy[group.id];
    return copy ? [{ ...group, ...copy }] : [];
  }) : [];

// Fictitious identifiers and illustrative attributes only. No price, inventory,
// real brand affiliation or warranty is invented for these preview cards.
export const previewProducts: readonly PreviewProduct[] = [
  { id: 'ups', name: 'Bộ lưu điện UPS Online', model: 'DEMO-UPS-01', sku: 'MAU-UPS-001', category: 'UPS & thiết bị nguồn', categoryId: 'power', specifications: [{ label: 'Công nghệ', value: 'Online (mẫu)' }, { label: 'Công suất', value: null }] },
  { id: 'printer', name: 'Máy in laser đơn năng', model: 'DEMO-PRINT-01', sku: 'MAU-PRINT-001', category: 'Máy in & vật tư', categoryId: 'printing', specifications: [{ label: 'Kiểu in', value: 'Đơn sắc (mẫu)' }, { label: 'Hiệu suất', value: null }] },
  { id: 'ssd', name: 'Ổ lưu trữ SSD NVMe', model: 'DEMO-SSD-01', sku: 'MAU-SSD-001', category: 'Linh kiện & phụ kiện', categoryId: 'components', specifications: [{ label: 'Giao tiếp', value: 'NVMe (mẫu)' }, { label: 'Dung lượng', value: null }] },
  { id: 'switch', name: 'Switch mạng công nghiệp', model: 'DEMO-NET-01', sku: 'MAU-NET-001', category: 'Mạng & công nghiệp', categoryId: 'network', specifications: [{ label: 'Nhóm thiết bị', value: 'Switch (mẫu)' }, { label: 'Cổng / PoE', value: null }] },
];

// Names from PRODUCT_CATALOG_PLAN.md; text only, no copied logos or claims
// of partnership/distribution. They do not identify the preview products above.
export const referenceBrands: readonly ReferenceBrand[] = [
  { name: 'PROLiNK', category: 'UPS, kết nối' },
  { name: 'Pantum', category: 'Máy in' },
  { name: 'TRM', category: 'RAM, SSD' },
  { name: 'Cooler Master', category: 'Linh kiện' },
  { name: 'Antec', category: 'Case, nguồn' },
  { name: 'ISON', category: 'Mạng công nghiệp' },
];
