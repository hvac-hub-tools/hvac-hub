import { UnitSpec } from "../data/hvacData";

interface Props {
  unit: UnitSpec;
  accent: string;
  badgeColor: string;
}

export default function UnitCard({ unit, accent, badgeColor }: Props) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} shadow hover:shadow-md transition-shadow duration-200 p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{unit.model}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {unit.capacity_tr} TR
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              unit.phase === "Single Phase"
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-700"
            }`}>
              {unit.phase === "Single Phase" ? "1Ø" : "3Ø"}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {unit.voltage}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-gray-800">{unit.power_input_kw}</div>
          <div className="text-xs text-gray-500 font-medium">kW Input</div>
        </div>
      </div>

      {/* Electrical Data Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <DataBox
          label="Running Current"
          value={`${unit.running_current_a} A`}
          icon="⚡"
          highlight
        />
        {unit.starting_current_a ? (
          <DataBox
            label="Starting Current"
            value={`${unit.starting_current_a} A`}
            icon="🔌"
          />
        ) : (
          <DataBox label="Frequency" value={unit.frequency} icon="🔁" />
        )}
        <DataBox
          label="MCA (Min. Circuit)"
          value={`${unit.mca} A`}
          icon="🔒"
        />
        <DataBox
          label="MOP / Breaker"
          value={`${unit.mop} A`}
          icon="🛡️"
        />
      </div>

      {/* Notes */}
      {unit.notes && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2 items-start">
          <span className="text-amber-500 text-sm mt-0.5">📝</span>
          <p className="text-xs text-amber-700 font-medium">{unit.notes}</p>
        </div>
      )}
    </div>
  );
}

function DataBox({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 ${highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <span>{icon}</span> {label}
      </div>
      <div className={`font-bold text-sm mt-0.5 ${highlight ? "text-blue-700" : "text-gray-800"}`}>
        {value}
      </div>
    </div>
  );
}
