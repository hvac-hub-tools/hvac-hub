import { ChillerSpec } from "../data/hvacData";

interface Props {
  unit: ChillerSpec;
}

export default function ChillerCard({ unit }: Props) {
  const isWC = unit.chiller_type === "Water Cooled";

  return (
    <div className={`bg-white rounded-xl border-l-4 ${isWC ? "border-teal-500" : "border-cyan-500"} shadow hover:shadow-md transition-shadow duration-200 p-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{unit.model}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isWC ? "bg-teal-100 text-teal-700" : "bg-cyan-100 text-cyan-700"}`}>
              {unit.capacity_tr} TR
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">3Ø</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isWC ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
              {isWC ? "💧 Water Cooled" : "💨 Air Cooled"}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {unit.compressor_type}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-gray-800">{unit.power_input_kw}</div>
          <div className="text-xs text-gray-500 font-medium">kW Input</div>
        </div>
      </div>

      {/* Electrical Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-lg px-3 py-2 bg-blue-50 border border-blue-100">
          <div className="text-xs text-gray-500 flex items-center gap-1"><span>⚡</span> Full Load Current</div>
          <div className="font-bold text-sm mt-0.5 text-blue-700">{unit.full_load_current_a} A</div>
        </div>
        {unit.starting_current_a ? (
          <div className="rounded-lg px-3 py-2 bg-gray-50">
            <div className="text-xs text-gray-500 flex items-center gap-1"><span>🔌</span> Starting Current</div>
            <div className="font-bold text-sm mt-0.5 text-gray-800">{unit.starting_current_a} A</div>
          </div>
        ) : (
          <div className="rounded-lg px-3 py-2 bg-gray-50">
            <div className="text-xs text-gray-500 flex items-center gap-1"><span>🔁</span> Voltage</div>
            <div className="font-bold text-sm mt-0.5 text-gray-800">{unit.voltage}</div>
          </div>
        )}
        <div className="rounded-lg px-3 py-2 bg-gray-50">
          <div className="text-xs text-gray-500 flex items-center gap-1"><span>🔒</span> MCA</div>
          <div className="font-bold text-sm mt-0.5 text-gray-800">{unit.mca} A</div>
        </div>
        <div className="rounded-lg px-3 py-2 bg-gray-50">
          <div className="text-xs text-gray-500 flex items-center gap-1"><span>🛡️</span> MOP / Breaker</div>
          <div className="font-bold text-sm mt-0.5 text-gray-800">{unit.mop} A</div>
        </div>
        <div className="rounded-lg px-3 py-2 bg-green-50 border border-green-100">
          <div className="text-xs text-gray-500 flex items-center gap-1"><span>🌿</span> COP</div>
          <div className="font-bold text-sm mt-0.5 text-green-700">{unit.cop}</div>
        </div>
        {unit.eer && (
          <div className="rounded-lg px-3 py-2 bg-green-50 border border-green-100">
            <div className="text-xs text-gray-500 flex items-center gap-1"><span>📊</span> EER (BTU/W)</div>
            <div className="font-bold text-sm mt-0.5 text-green-700">{unit.eer}</div>
          </div>
        )}
      </div>

      {unit.notes && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2 items-start">
          <span className="text-amber-500 text-sm mt-0.5">📝</span>
          <p className="text-xs text-amber-700 font-medium">{unit.notes}</p>
        </div>
      )}
    </div>
  );
}
