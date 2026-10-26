'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Boxes, ChevronLeft, ChevronRight, CircleAlert, ClipboardList, LayoutDashboard,
  LogOut, Menu, Plus, Search, ShoppingCart, Store, Truck, X,
} from 'lucide-react';
import { api, getRole, normalizePage, type BookDto, type OrderDto, type PurchaseDto, type Role, type SupplierDto } from '@/common/services/api';

type Module = 'Resumen' | 'Libros' | 'Compras' | 'Ventas' | 'Proveedores';
type Row = BookDto | SupplierDto | PurchaseDto | OrderDto;

const menu: { label: Module; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { label: 'Resumen', icon: LayoutDashboard, roles: ['ADMIN', 'SELLER', 'WAREHOUSE', 'READER'] },
  { label: 'Libros', icon: BookOpen, roles: ['ADMIN', 'SELLER', 'WAREHOUSE', 'READER'] },
  { label: 'Compras', icon: ShoppingCart, roles: ['ADMIN', 'WAREHOUSE'] },
  { label: 'Ventas', icon: ClipboardList, roles: ['ADMIN', 'SELLER', 'WAREHOUSE', 'READER'] },
  { label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'WAREHOUSE'] },
];

const money = (value = 0) => new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(value);
const displayDate = (value?: string) => value ? new Date(value).toLocaleDateString('es-PY') : '—';

export default function Home() {
  const router = useRouter();
  const [active, setActive] = useState<Module>('Resumen');
  const [role] = useState<Role>(getRole());
  const [open, setOpen] = useState(false);
  const visibleMenu = menu.filter(item => item.roles.includes(role));

  useEffect(() => {
    if (!document.cookie.includes('token=') && !localStorage.getItem('token')) router.push('/auth/login');
  }, [router]);

  function logout() {
    document.cookie = 'token=; Max-Age=0; path=/';
    document.cookie = 'role=; Max-Age=0; path=/';
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="drawer lg:drawer-open">
        <input id="main-drawer" type="checkbox" className="drawer-toggle" checked={open} onChange={event => setOpen(event.target.checked)} />
        <div className="drawer-content">
          <div className="navbar sticky top-0 z-20 border-b border-base-300 bg-base-100/95 px-5 backdrop-blur lg:px-9">
            <div className="navbar-start gap-3">
              <label htmlFor="main-drawer" className="btn btn-ghost btn-square lg:hidden"><Menu size={20} /></label>
              <div>
                <p className="font-serif text-xl font-bold tracking-tight">Big<span className="text-primary">o</span>Books</p>
                <p className="hidden text-[10px] font-bold uppercase tracking-[.2em] text-base-content/50 sm:block">gestión editorial</p>
              </div>
            </div>
            <div className="navbar-end gap-3">
              <div className="hidden text-right sm:block"><p className="text-sm font-bold">Panel de trabajo</p><p className="text-xs text-base-content/50">{role}</p></div>
              <div className="avatar placeholder"><div className="w-10 rounded-full bg-primary/15 text-primary"><span className="font-bold">{role.slice(0, 2)}</span></div></div>
            </div>
          </div>
          <main className="mx-auto max-w-[1400px] p-5 lg:p-9">
            {active === 'Resumen' ? <Overview onNavigate={setActive} /> : <ModuleView module={active} role={role} />}
          </main>
        </div>
        <div className="drawer-side z-30">
          <label htmlFor="main-drawer" aria-label="cerrar menú" className="drawer-overlay" />
          <aside className="flex min-h-full w-72 flex-col bg-neutral px-4 py-6 text-neutral-content">
            <div className="mb-9 flex items-center justify-between px-3">
              <div><p className="font-serif text-2xl font-bold">Bigo<span className="text-primary">Books</span></p><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-neutral-content/50">sistema unificado</p></div>
              <label htmlFor="main-drawer" className="btn btn-ghost btn-square btn-sm lg:hidden"><X size={18} /></label>
            </div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-neutral-content/40">Navegación principal</p>
            <ul className="menu gap-1">
              {visibleMenu.map(item => { const Icon = item.icon; return <li key={item.label}><button className={active === item.label ? 'active' : ''} onClick={() => { setActive(item.label); setOpen(false); }}><Icon size={18} />{item.label}</button></li>; })}
            </ul>
            <div className="mt-auto rounded-box bg-neutral-content/5 p-4">
              <p className="text-xs font-semibold">Sesión segura</p><p className="mt-1 text-xs text-neutral-content/50">Conectado al API Gateway</p>
              <button onClick={logout} className="btn btn-ghost btn-sm mt-4 w-full justify-start gap-2 text-error"><LogOut size={15} />Cerrar sesión</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (module: Module) => void }) {
  const [data, setData] = useState<{ books: BookDto[]; purchases: PurchaseDto[]; orders: OrderDto[]; suppliers: SupplierDto[] }>({ books: [], purchases: [], orders: [], suppliers: [] });
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.books(), api.purchases(), api.orders(), api.suppliers()])
      .then(([books, purchases, orders, suppliers]) => setData({ books: normalizePage(books).data, purchases: normalizePage(purchases).data, orders: normalizePage(orders).data, suppliers: normalizePage(suppliers).data }))
      .catch(reason => setError(reason instanceof Error ? reason.message : 'No se pudo cargar el resumen.'));
  }, []);
  const pending = data.purchases.filter(item => item.status === 'PENDING').length;
  return <section>
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">Panel de control</p><h1 className="font-serif text-4xl font-bold tracking-tight">Buenos días, equipo.</h1><p className="mt-2 text-base-content/60">Todo lo que pasa en tu librería, en un solo lugar.</p></div><button onClick={() => onNavigate('Libros')} className="btn btn-primary gap-2"><Plus size={17} />Nueva operación</button></div>
    {error && <div role="alert" className="alert alert-warning mb-6"><CircleAlert size={18} /><span>{error}</span></div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={BookOpen} label="Libros catalogados" value={data.books.length} trend="Catálogo activo" />
      <Stat icon={ShoppingCart} label="Compras pendientes" value={pending} trend="Requieren atención" />
      <Stat icon={ClipboardList} label="Ventas recientes" value={data.orders.length} trend="Últimos registros" />
      <Stat icon={Truck} label="Proveedores" value={data.suppliers.length} trend="Proveedores activos" />
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body"><div className="flex items-center justify-between"><div><h2 className="card-title">Actividad reciente</h2><p className="text-sm text-base-content/50">Últimas compras registradas</p></div><button onClick={() => onNavigate('Compras')} className="btn btn-ghost btn-sm text-primary">Ver todo</button></div><RecentPurchases purchases={data.purchases.slice(0, 4)} /></div></div>
      <div className="card overflow-hidden border-0 bg-neutral text-neutral-content shadow-sm"><div className="card-body"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-neutral-content/50">Inventario</p><h2 className="mt-2 font-serif text-2xl font-bold">Tu catálogo al día</h2></div><Boxes className="text-primary" size={27} /></div><div className="mt-6 flex items-end gap-3"><span className="text-5xl font-bold text-primary">{data.books.length}</span><span className="mb-1 text-sm text-neutral-content/60">libros disponibles<br />en catálogo</span></div><button onClick={() => onNavigate('Libros')} className="btn btn-primary mt-5 w-full">Gestionar libros</button></div></div>
    </div>
  </section>;
}

function Stat({ icon: Icon, label, value, trend }: { icon: typeof BookOpen; label: string; value: number; trend: string }) {
  return <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body gap-3 p-5"><div className="flex items-center justify-between"><span className="rounded-box bg-primary/10 p-2.5 text-primary"><Icon size={19} /></span><span className="badge badge-ghost text-[10px]">EN VIVO</span></div><div><p className="text-3xl font-bold">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-base-content/45">{trend}</p></div></div></div>;
}

function RecentPurchases({ purchases }: { purchases: PurchaseDto[] }) {
  if (!purchases.length) return <div className="py-12 text-center text-sm text-base-content/50">No hay compras para mostrar.</div>;
  return <div className="mt-5 divide-y divide-base-200">{purchases.map(item => <div key={item.id} className="flex items-center gap-3 py-3"><div className="rounded-box bg-base-200 p-2 text-primary"><Store size={17} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.supplierName || 'Proveedor sin nombre'}</p><p className="text-xs text-base-content/50">Factura {item.invoiceNumber} · {displayDate(item.createdAt)}</p></div><div className="text-right"><p className="text-sm font-bold">{money(item.totalPrice)}</p><span className={`badge badge-sm ${item.status === 'RECEIVED' ? 'badge-success' : 'badge-warning'}`}>{item.status}</span></div></div>)}</div>;
}

function ModuleView({ module, role }: { module: Exclude<Module, 'Resumen'>; role: Role }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { const request = module === 'Libros' ? api.books(search, page) : module === 'Compras' ? api.purchases(page) : module === 'Ventas' ? api.orders(page) : api.suppliers(page); request.then(result => { const normalized = normalizePage<Row>(result as { data?: Row[] } | Row[]); setError(''); setRows(normalized.data); setTotalPages(normalized.totalPages); }).catch(reason => setError(reason instanceof Error ? reason.message : 'No se pudo cargar el módulo.')).finally(() => setLoading(false)); }, [module, page, search]);
  const filtered = useMemo(() => module === 'Libros' && search ? rows.filter(row => (row as BookDto).title?.toLowerCase().includes(search.toLowerCase())) : rows, [module, rows, search]);
  const canWrite = role === 'ADMIN' || (module === 'Ventas' && role === 'SELLER') || (module === 'Compras' && role === 'WAREHOUSE');
  return <section><div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-primary">Gestión</p><h1 className="font-serif text-4xl font-bold">{module}</h1><p className="mt-2 text-base-content/60">Consulta y administra la información del sistema.</p></div>{canWrite && <button className="btn btn-primary gap-2"><Plus size={17} />Nuevo {module === 'Libros' ? 'libro' : module === 'Proveedores' ? 'proveedor' : module === 'Compras' ? 'compra' : 'registro'}</button>}</div>
    {error && <div role="alert" className="alert alert-error mb-5"><CircleAlert size={18} /><span>{error}</span></div>}
    <div className="card border border-base-300 bg-base-100 shadow-sm"><div className="card-body p-0"><div className="flex flex-col gap-3 border-b border-base-200 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={17} /><input className="input input-bordered w-full pl-10" placeholder={`Buscar ${module.toLowerCase()}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></div><span className="text-xs text-base-content/50">{filtered.length} resultados visibles</span></div><DataTable module={module} rows={filtered} loading={loading} /><div className="flex items-center justify-between border-t border-base-200 p-4"><span className="text-xs text-base-content/50">Página {page + 1} de {totalPages}</span><div className="join"><button className="btn btn-sm join-item" disabled={page === 0} onClick={() => setPage(current => current - 1)}><ChevronLeft size={16} /></button><button className="btn btn-sm join-item" disabled={page + 1 >= totalPages} onClick={() => setPage(current => current + 1)}><ChevronRight size={16} /></button></div></div></div></div>
  </section>;
}

function DataTable({ module, rows, loading }: { module: Exclude<Module, 'Resumen'>; rows: Row[]; loading: boolean }) {
  if (loading) return <div className="flex min-h-64 items-center justify-center"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  if (!rows.length) return <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center"><BookOpen className="text-base-content/20" size={36} /><p className="font-semibold">No encontramos resultados</p><p className="text-sm text-base-content/50">Prueba con otros términos de búsqueda.</p></div>;
  return <div className="overflow-x-auto"><table className="table table-zebra"><thead><tr>{module === 'Libros' ? <><th>Libro</th><th>Autor</th><th>Género</th><th>Precio</th></> : module === 'Proveedores' ? <><th>Proveedor</th><th>RUC</th><th>Estado</th></> : module === 'Compras' ? <><th>Factura</th><th>Proveedor</th><th>Fecha</th><th>Estado</th><th>Total</th></> : <><th>Venta</th><th>Fecha</th><th>Estado</th><th>Total</th></>}</tr></thead><tbody>{rows.map(row => <tr key={row.id}>{module === 'Libros' && <><td className="font-bold">{(row as BookDto).title}</td><td>{(row as BookDto).authorName || (row as BookDto).author?.name || '—'}</td><td>{(row as BookDto).genreName || '—'}</td><td className="font-semibold text-primary">{money((row as BookDto).price)}</td></>}{module === 'Proveedores' && <><td className="font-bold">{(row as SupplierDto).name}</td><td>{(row as SupplierDto).ruc || '—'}</td><td><span className="badge badge-success badge-sm">Activo</span></td></>}{module === 'Compras' && <><td className="font-bold">{(row as PurchaseDto).invoiceNumber}</td><td>{(row as PurchaseDto).supplierName || '—'}</td><td>{displayDate((row as PurchaseDto).createdAt)}</td><td><span className="badge badge-warning badge-sm">{(row as PurchaseDto).status}</span></td><td className="font-semibold">{money((row as PurchaseDto).totalPrice)}</td></>}{module === 'Ventas' && <><td className="font-bold">Venta #{String(row.id).padStart(4, '0')}</td><td>{displayDate((row as OrderDto).createdAt)}</td><td><span className="badge badge-info badge-sm">{(row as OrderDto).status}</span></td><td className="font-semibold">{money((row as OrderDto).total || (row as OrderDto).totalPrice)}</td></>}</tr>)}</tbody></table></div>;
}
