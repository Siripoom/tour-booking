import AdminAuthGate from "@/components/AdminAuthGate";
import AdminCatalogManager from "@/components/AdminCatalogManager";
import BookingsTable from "@/components/BookingsTable";

export default function AdminPage() {
  return (
    <div className="page-shell min-h-screen">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Manage bookings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Review recent bookings, search, and verify details before follow-up.
          </p>
        </div>
        <AdminAuthGate>
          <div className="flex flex-col gap-8">
            <BookingsTable />
            <AdminCatalogManager />
          </div>
        </AdminAuthGate>
      </div>
    </div>
  );
}
