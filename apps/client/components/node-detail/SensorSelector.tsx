import { Button } from "@heroui/react";
import type { SensorKey } from "../../types/monitoreo";
import { SENSOR_LABELS } from "../../utils/monitoreoStatus";

const SENSORS: SensorKey[] = ["mq2", "mq3", "mq135", "mq9"];

interface SensorSelectorProps {
  selected: SensorKey;
  onSelect: (sensor: SensorKey) => void;
}

export default function SensorSelector({
  selected,
  onSelect,
}: SensorSelectorProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Selector de sensor"
    >
      {SENSORS.map((sensor) => {
        const label = SENSOR_LABELS[sensor];
        const isActive = selected === sensor;
        return (
          <Button
            key={sensor}
            role="tab"
            aria-selected={isActive}
            radius="full"
            variant={isActive ? "solid" : "bordered"}
            className={
              isActive
                ? "bg-[#F8B519] text-[#0F0F0F] font-semibold"
                : "border-[#333333] text-[#dddddd]"
            }
            onPress={() => onSelect(sensor)}
          >
            {label.name}
          </Button>
        );
      })}
    </div>
  );
}
