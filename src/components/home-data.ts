import { previewNavigation, type CategoryGroup } from './navigation-data';
import { catalogCategories, categoryIconId, findItem, productHref, specDefinitions } from './catalog-data';
import { saleIssue, specText } from './catalog-model';

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
  href: string;
  price: number | null;
  availability: string;
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

// Homepage and catalog use the same synthetic fixtures. These are not prices,
// inventory or specifications of real products sold by the business.
export const previewProducts: readonly PreviewProduct[] = ['DEMO-U1000-T', 'DEMO-P100', 'DEMO-SN-512', 'DEMO-N8'].flatMap((sku) => {
  const item = findItem(sku);
  if (!item) return [];
  return [{ id: sku, name: item.product.name, model: item.product.model, sku,
    category: catalogCategories.find((category) => category.slug === item.product.category)?.label ?? '',
    categoryId: categoryIconId(item.product.category), href: productHref(item), price: item.variant.price,
    availability: saleIssue(item) ?? 'Có thể xem và thử thêm giỏ',
    specifications: specDefinitions[item.product.family].slice(0, 2).map((definition) => ({ label: definition.label, value: specText(item.variant.specs[definition.key], definition) })),
  }];
});

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
