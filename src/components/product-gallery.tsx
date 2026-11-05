import { useState } from 'react';
import type { DemoProduct } from './catalog-data';
import { CategoryIcon } from './category-icon';

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="flex h-full flex-col items-center justify-center p-6 text-center"><p role="status" className="text-sm text-muted">Không tải được hình minh họa.</p><button type="button" className="secondary-button mt-3" onClick={() => setFailed(false)}>Tải lại hình</button></div>;
  return <img src={src} alt={alt} width="640" height="480" className="h-full w-full object-contain" onError={() => setFailed(true)} />;
}
export function ProductGallery({ images, icon }: { images: DemoProduct['images']; icon: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return <section aria-label="Hình ảnh sản phẩm">
    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface">
      {current ? <GalleryImage key={current.src} src={current.src} alt={current.alt} /> : <div className="flex h-full flex-col items-center justify-center gap-4 text-muted"><CategoryIcon categoryId={icon} size={72} /><p>Chưa có ảnh sản phẩm được duyệt.</p></div>}
    </div>
    {images.length > 1 && <div aria-label="Chọn hình minh họa" className="mt-3 flex gap-3">{images.map((image, imageIndex) => <button key={image.src} type="button" aria-pressed={index === imageIndex} className={index === imageIndex ? 'primary-button' : 'secondary-button'} onClick={() => setIndex(imageIndex)}>Hình {imageIndex + 1}</button>)}</div>}
    {images.length > 0 && <p className="mt-3 text-xs leading-6 text-muted">Hình sơ đồ DEMO, không phải ảnh hoặc cấu tạo của model thật.</p>}
  </section>;
}
