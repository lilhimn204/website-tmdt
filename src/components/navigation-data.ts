export interface NavigationItem {
  label: string;
  to: string;
  available: boolean;
}

export interface CategoryGroup extends NavigationItem {
  id: string;
  children: readonly NavigationItem[];
}

export type NavigationState =
  | { status: 'ready'; groups: readonly CategoryGroup[]; preview?: boolean }
  | { status: 'loading' }
  | { status: 'error'; onRetry: () => void };

export const destinations = {
  home: { label: 'Trang chủ', to: '/', available: true },
  categories: { label: 'Danh mục', to: '/danh-muc/', available: true },
  products: { label: 'Tất cả sản phẩm', to: '/san-pham/', available: true },
  brands: { label: 'Thương hiệu', to: '/thuong-hieu/', available: false },
  quote: { label: 'Yêu cầu báo giá', to: '/bao-gia/', available: false },
  support: { label: 'Hỗ trợ', to: '/ho-tro/', available: false },
  cart: { label: 'Giỏ hàng', to: '/gio-hang/', available: true },
  about: { label: 'Giới thiệu', to: '/gioi-thieu/', available: false },
  contact: { label: 'Liên hệ', to: '/lien-he/', available: false },
  guide: { label: 'Hướng dẫn sử dụng', to: '/ho-tro/huong-dan-su-dung/', available: false },
} satisfies Record<string, NavigationItem>;

export const policyLinks: readonly NavigationItem[] = [
  { label: 'Bảo hành', to: '/chinh-sach/bao-hanh/', available: false },
  { label: 'Kiểm hàng & đổi trả', to: '/chinh-sach/doi-tra/', available: false },
  { label: 'Giao hàng', to: '/chinh-sach/van-chuyen/', available: false },
  { label: 'Thanh toán', to: '/chinh-sach/thanh-toan/', available: false },
  { label: 'Bảo vệ thông tin', to: '/chinh-sach/bao-mat/', available: false },
  { label: 'Điều kiện giao dịch', to: '/chinh-sach/dieu-kien-giao-dich/', available: false },
];

function category(label: string, slug: string): NavigationItem {
  return { label, to: `/danh-muc/${slug}/`, available: true };
}

// Preview taxonomy from SITEMAP, not a published catalog or stock declaration.
// Conditional accessory groups are excluded until business approval.
export const previewNavigation: NavigationState = {
  status: 'ready',
  preview: true,
  groups: [
    {
      ...category('UPS & thiết bị nguồn', 'ups-thiet-bi-nguon'), id: 'power',
      children: [category('UPS Line Interactive', 'ups-line-interactive'), category('UPS Online một pha', 'ups-online-mot-pha'), category('UPS Online ba pha', 'ups-online-ba-pha'), category('IPS', 'ips')],
    },
    {
      ...category('Máy in & vật tư', 'may-in-vat-tu'), id: 'printing',
      children: [category('Máy in đơn năng', 'may-in-don-nang'), category('Máy in đa năng', 'may-in-da-nang')],
    },
    {
      ...category('Linh kiện & phụ kiện', 'linh-kien-phu-kien'), id: 'components',
      children: [category('RAM', 'ram'), category('SSD', 'ssd'), category('Mainboard', 'mainboard'), category('Nguồn máy tính', 'nguon-may-tinh'), category('Case', 'case-may-tinh'), category('Tản nhiệt khí', 'tan-nhiet-khi'), category('Tản nhiệt AIO', 'tan-nhiet-aio')],
    },
    {
      ...category('Mạng & công nghiệp', 'mang-cong-nghiep'), id: 'network',
      children: [category('Switch công nghiệp', 'switch-cong-nghiep'), category('Switch PoE công nghiệp', 'switch-poe-cong-nghiep'), category('Wi-Fi di động', 'wifi-di-dong')],
    },
  ],
};
