import { BatteryChargingIcon } from '@phosphor-icons/react/dist/csr/BatteryCharging';
import { PrinterIcon } from '@phosphor-icons/react/dist/csr/Printer';
import { CpuIcon } from '@phosphor-icons/react/dist/csr/Cpu';
import { NetworkIcon } from '@phosphor-icons/react/dist/csr/Network';
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package';

export function CategoryIcon({ categoryId, size = 32 }: { categoryId: string; size?: number }) {
  const Icon = ({ power: BatteryChargingIcon, printing: PrinterIcon, components: CpuIcon, network: NetworkIcon })[categoryId] ?? PackageIcon;
  return <Icon size={size} weight="duotone" aria-hidden="true" className="shrink-0" />;
}
