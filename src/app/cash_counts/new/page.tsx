'use client';

import { useAuth } from '@/app/authcontext';
import { useApi } from '@/app/hooks/useApi';
import { useEffect, useState } from 'react';

// Denominations you want to support
const DENOMINATIONS = [
  { label: '$100', value: 100.0 },
  { label: '$50',  value: 50.0 },
  { label: '$20',  value: 20.0 },
  { label: '$10',  value: 10.0 },
  { label: '$5',   value: 5.0  },
  { label: '$1',   value: 1.0  },
  { label: '25¢',  value: 0.25 },
  { label: '10¢',  value: 0.10 },
  { label: '5¢',   value: 0.05 },
  { label: '1¢',   value: 0.01 },
];

// Data shape for form
type Registry = {
  id: number;
  name: string;
};

type CashCountInput = {
  registry_id: number;
  date_counted: string;
  reported_amount: number;
  actual_breakdown: Record<string, number>;  // e.g. { "100.00": 2, "50.00": 1 }
  actual_total: number;
  leftover_breakdown: Record<string, number>;
  leftover_total: number;
  over_short: number;
  note: string;
  coinsTotal: number;
  billsTotal: number;
  leftoverCoinsTotal: number;
  leftoverBillsTotal: number;
};

export default function NewCashCountPage() {
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth, isLoading: authLoading } = useAuth();
  const { fetchWithAuth } = useApi();

  const initialFormState: CashCountInput = {
    registry_id: 0,
    date_counted: new Date().toISOString(),
    reported_amount: 0,
    actual_breakdown: {},
    actual_total: 0,
    leftover_breakdown: {},
    leftover_total: 0,
    over_short: 0,
    note: '',
    coinsTotal: 0,
    billsTotal: 0,
    leftoverCoinsTotal: 0,
    leftoverBillsTotal: 0
  };

  // The main form state
  const [form, setForm] = useState<CashCountInput>(initialFormState);

  useEffect(() => {
    if (authLoading) return;
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const fetchRegistries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchWithAuth('/api/registries');
        setRegistries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch registries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistries();
  }, [auth, authLoading]);
  // Fetch registries for the dropdown
  // useEffect(() => {
  //   fetch(`${API_BASE}/api/registries`, { headers: { Authorization: 'Basic ' + btoa(`${auth?.username}:${auth?.password}`) } })
  //     .then(res => res.json())
  //     .then(data => setRegistries(data))
  //     .catch(console.error);
  // }, [API_BASE]);




  // Helper to compute the total from a breakdown object
  function calculateTotal(breakdown: Record<string, number>): number {
    let total = 0;
    for (const denomStr in breakdown) {
      const denomValue = parseFloat(denomStr);
      const quantity = breakdown[denomStr] || 0;
      total += denomValue * quantity;
    }
    return total;
  }

  /**
 * Takes a breakdown object like { "100.00": 2, "50.00": 1, "0.25": 4 }
 * and returns the total value of bills vs. coins separately.
 *
 * @param breakdown - An object where keys are stringified denominations (e.g. "100.00")
 *                    and values are the integer quantity (e.g. 2).
 * @returns An object with { billsTotal, coinsTotal } in numeric form.
 */
function countBillsAndCoins(
    breakdown: Record<string, number>
  ): { billsTotal: number; coinsTotal: number } {
    let billsTotal = 0;
    let coinsTotal = 0;
  
    for (const denomStr in breakdown) {
      const denomValue = parseFloat(denomStr); // e.g. "100.00" -> 100
      const quantity = breakdown[denomStr] || 0;
  
      if (denomValue >= 1) {
        // Treat anything $1 or above as "bills"
        billsTotal += denomValue * quantity;
      } else {
        // Anything below $1.00 is "coins"
        coinsTotal += denomValue * quantity;
      }
    }
  
    return { billsTotal, coinsTotal };
  }

  //   // Form update functions
  // const updateField = <T extends keyof CashCountInput>(
  //     field: T,
  //     value: CashCountInput[T]
  // ) => {
  //   setForm(prev => ({ ...prev, [field]: value }));
  // };

  // const updateActualDenom = (denomValue: number, quantity: number) => {
  //   setForm(prev => ({
  //     ...prev,
  //     actual_breakdown: {
  //       ...prev.actual_breakdown,
  //       [denomValue.toFixed(2)]: quantity,
  //     },
  //   }));
  // };

  // const updateLeftoverDenom = (denomValue: number, quantity: number) => {
  //   setForm(prev => ({
  //     ...prev,
  //     leftover_breakdown: {
  //       ...prev.leftover_breakdown,
  //       [denomValue.toFixed(2)]: quantity,
  //     },
  //   }));
  // };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!auth) return;
  
      try {
        setIsSubmitting(true);
        setError(null);
  
        const response = await fetchWithAuth<{ id: number }>('/api/cash_counts', {
          method: 'POST',
          body: form,
        });
  
        // Reset form on success
        setForm(initialFormState);
        alert(`Created cash count with ID: ${response.id}`);
        // Optionally redirect:
        // window.location.href = '/cash_counts';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create cash count');
      } finally {
        setIsSubmitting(false);
      }
    };

  // Whenever actual_breakdown, leftover_breakdown, or reported_amount changes,
  // recalc actual_total, leftover_total, and over_short.
  useEffect(() => {
    const at = calculateTotal(form.actual_breakdown);
    const lt = calculateTotal(form.leftover_breakdown);
    const { billsTotal, coinsTotal } = countBillsAndCoins(form.actual_breakdown);
    const leftover = countBillsAndCoins(form.leftover_breakdown);
    const overShort = at - form.reported_amount;
    setForm(prev => ({
      ...prev,
      actual_total: at,
      leftover_total: lt,
      over_short: overShort,
      coinsTotal: coinsTotal,
      billsTotal: billsTotal,
        leftoverCoinsTotal: leftover.coinsTotal,
        leftoverBillsTotal: leftover.billsTotal

    }));
  }, [form.actual_breakdown, form.leftover_breakdown, form.reported_amount]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">Please log in to view cash counts</p>
      </div>
    )
  }

  // Convert local "YYYY-MM-DDTHH:mm" to UTC ISO
  function toUtcISOString(localValue: string): string {
    const localDate = new Date(localValue);
    return localDate.toISOString();
  }

  // Convert UTC ISO -> local "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
  function toLocalInputValue(utcISO: string): string {
    if (!utcISO) return '';
    const utcDate = new Date(utcISO);
    const localTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    return localTime.toISOString().slice(0, 16);
  }

  // Update a single field in the main form (for reported_amount, note, etc.)
  function updateField<T extends keyof CashCountInput>(field: T, value: CashCountInput[T]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // Update the quantity for a given denomination in actual_breakdown
  function updateActualDenom(denomValue: number, quantity: number) {
    setForm(prev => ({
      ...prev,
      actual_breakdown: {
        ...prev.actual_breakdown,
        [denomValue.toFixed(2)]: quantity,
      },
    }));
  }

  // Update the quantity for a given denomination in leftover_breakdown
  function updateLeftoverDenom(denomValue: number, quantity: number) {
    setForm(prev => ({
      ...prev,
      leftover_breakdown: {
        ...prev.leftover_breakdown,
        [denomValue.toFixed(2)]: quantity,
      },
    }));
  }

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault();
  //   try {
  //     const res = await fetch(`${API_BASE}/api/cash_counts`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(form),
  //     });
  //     if (!res.ok) {
  //       console.error('Error creating cash count');
  //       return;
  //     }
  //     const data = await res.json();
  //     alert(`Created cash count with ID: ${data.id}`);
  //     // Reset or navigate as desired
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create New Cash Count</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">

        {/* Registry dropdown */}
        <div>
          <label className="block font-medium mb-1">Registry</label>
          <select
            className="border p-1 w-full"
            value={form.registry_id}
            onChange={e => updateField('registry_id', parseInt(e.target.value))}
          >
            <option value={0}>-- select --</option>
            {registries.map(reg => (
              <option key={reg.id} value={reg.id}>
                {reg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date/Time */}
        <div>
          <label className="block font-medium mb-1">Date Counted</label>
          <input
            type="datetime-local"
            className="border p-1 w-full"
            value={toLocalInputValue(form.date_counted)}
            onChange={e => {
              const utcString = toUtcISOString(e.target.value);
              updateField('date_counted', utcString);
            }}
          />
        </div>

        {/* Reported Amount */}
        <div>
          <label className="block font-medium mb-1">Reported Amount</label>
          <input
            type="number"
            step="0.01"
            className="border p-1 w-full"
            onFocus={(e) => e.target.select()}
            value={form.reported_amount}
            onChange={e => updateField('reported_amount', parseFloat(e.target.value))}
          />
        </div>

        {/* Actual Breakdown Section */}
        <div>
          <h2 className="font-bold mb-2">Actual Breakdown</h2>
          <div className="grid grid-cols-3 gap-2">
            {DENOMINATIONS.map((den) => {
              const qty = form.actual_breakdown[den.value.toFixed(2)] || 0;
              return (
                <div key={den.value} className="flex items-center">
                  <label className="w-16">{den.label}</label>
                  <input
                    type="number"
                    className="border p-1 ml-2 w-full"
                    min={0}
                    value={qty}
                    onFocus={(e) => e.target.select()}
                    onChange={e => updateActualDenom(den.value, parseInt(e.target.value || '0'))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Actual Total (read-only) */}
        <div className="mt-4 flex flex-row">
        <div>
          <label className="block font-medium mb-1">Actual Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.actual_total}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Bills Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.billsTotal}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Coins Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.coinsTotal}
          />
        </div>
        </div>

        {/* Leftover Breakdown Section */}
        <div>
          <h2 className="font-bold mb-2">Leftover Breakdown</h2>
          <div className="grid grid-cols-3 gap-2">
            {DENOMINATIONS.map((den) => {
              const qty = form.leftover_breakdown[den.value.toFixed(2)] || 0;
              return (
                <div key={den.value} className="flex items-center">
                  <label className="w-16">{den.label}</label>
                  <input
                    type="number"
                    className="border p-1 ml-2 w-full"
                    min={0}
                    value={qty}
                    onFocus={(e) => e.target.select()}
                    onChange={e => updateLeftoverDenom(den.value, parseInt(e.target.value || '0'))}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <h5 className="font-bold">Leftover Breakdown Total</h5>
        <div className="mt-4 flex flex-row">
        {/* Leftover Total (read-only) */}
        <div>
          <label className="block font-medium mb-1">Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.leftover_total}
          />
        </div>

        {/* Leftover Bills Total (read-only) */}
        <div>
          <label className="block font-medium mb-1">Bills Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.leftoverBillsTotal}
          />
        </div>

        {/* Leftover Coins Total (read-only) */}
        <div>
          <label className="block font-medium mb-1">Coins Total</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.leftoverCoinsTotal}
          />
        </div>
        </div>

        {/* Over/Short (read-only) */}
        <div>
          <label className="block font-medium mb-1">Over/Short</label>
          <input
            type="number"
            step="0.01"
            readOnly
            className="border p-1 w-full bg-gray-100"
            value={form.over_short}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block font-medium mb-1">Note</label>
          <input
            type="text"
            className="border p-1 w-full"
            value={form.note}
            onChange={e => updateField('note', e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Cash Count
        </button>
      </form>
    </div>
  );
}