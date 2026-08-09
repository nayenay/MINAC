import { Chip } from "@heroui/react";
import type { NodeStatus } from "../../types/monitoreo";
import { NODE_STATUS_LABELS } from "../../utils/monitoreoStatus";

const STATUS_STYLES: Record<NodeStatus, string> = {
  normal: "bg-[#00824F] text-white",
  advertencia: "bg-[#F8B519] text-[#0F0F0F]",
  peligro: "bg-[#821600] text-white",
  sin_datos: "bg-[#333333] text-[#cccccc]",
};

interface StatusBadgeProps {
  status: NodeStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Chip className={`${STATUS_STYLES[status]} font-semibold`}>
      {NODE_STATUS_LABELS[status]}
    </Chip>
  );
}
