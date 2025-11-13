// src/components/admin/services/CreateServiceModal.tsx
import { X } from "lucide-react";
import { useState } from "react";

interface FeeRow {
  type: string;
  amount: string;               // keep as string while editing
}

interface Props {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateServiceModal({ onClose, onCreate }: Props) {
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    processing_time: "",
    required_documents: "",
    eligibility_requirements: "",
    display_order: 99,
    is_active: true,
  });

  const [fees, setFees] = useState<FeeRow[]>([
    { type: "standard", amount: "0" },
  ]);

  const addFeeRow = () => setFees((prev) => [...prev, { type: "", amount: "" }]);

  const removeFeeRow = (idx: number) =>
    setFees((prev) => prev.filter((_, i) => i !== idx));

  const updateFeeRow = (idx: number, field: "type" | "amount", value: string) =>
    setFees((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );

  const handleSubmit = () => {
    try {
      // ---- build fees array (skip empty rows) ----
      const parsedFees = fees
        .filter((r) => r.type.trim() && r.amount.trim())
        .map((r) => ({
          type: r.type.trim(),
          amount: Number(r.amount),
        }));

      const payload = {
        category: form.category,
        title: form.title,
        description: form.description,
        processing_time: form.processing_time,
        fees: parsedFees,
        required_documents: form.required_documents
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        eligibility_requirements: form.eligibility_requirements
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        display_order: Number(form.display_order),
        is_active: form.is_active ? 1 : 0,
      };

      onCreate(payload);
      onClose();
    } catch (err) {
      alert("Please fill all fee rows correctly (type + amount)");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Create New Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* ---- existing fields ---- */}
          <input placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Description" rows={3} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Processing Time (e.g. 4-6 weeks)" value={form.processing_time}
            onChange={(e) => setForm({ ...form, processing_time: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />

          {/* ---- NEW: Fees table ---- */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Fees</label>
              <button type="button" onClick={addFeeRow}
                className="text-xs text-blue-600 hover:text-blue-800">
                + Add fee
              </button>
            </div>

            <div className="space-y-2">
              {fees.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    placeholder="Type (e.g. standard, express)"
                    value={row.type}
                    onChange={(e) => updateFeeRow(idx, "type", e.target.value)}
                    className="flex-1 px-3 py-1 border rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => updateFeeRow(idx, "amount", e.target.value)}
                    className="w-24 px-3 py-1 border rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeeRow(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <input placeholder="Required Documents (comma-separated)" value={form.required_documents}
            onChange={(e) => setForm({ ...form, required_documents: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Eligibility Requirements (comma-separated)" value={form.eligibility_requirements}
            onChange={(e) => setForm({ ...form, eligibility_requirements: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <input type="number" placeholder="Display Order" value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: +e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4" />
            <span>Active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Service
          </button>
        </div>
      </div>
    </div>
  );
}