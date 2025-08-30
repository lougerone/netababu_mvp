import type { Politician } from './CardPolitician';

export default function CompareTable({ a, b }: { a: Politician | null; b: Politician | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="py-2 pr-4">Metric</th>
            <th className="py-2 pr-4">A</th>
            <th className="py-2 pr-4">B</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          <tr>
            <td className="py-2 pr-4">Name</td>
            <td className="py-2 pr-4">{a?.name ?? '—'}</td>
            <td className="py-2 pr-4">{b?.name ?? '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4">Party</td>
            <td className="py-2 pr-4">{a?.party ?? '—'}</td>
            <td className="py-2 pr-4">{b?.party ?? '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4">State</td>
            <td className="py-2 pr-4">{a?.state ?? '—'}</td>
            <td className="py-2 pr-4">{b?.state ?? '—'}</td>
          </tr>
          <tr>
            <td className="py-2 pr-4">Current Position</td>
            <td className="py-2 pr-4">{a?.current_position ?? '—'}</td>
            <td className="py-2 pr-4">{b?.current_position ?? '—'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
