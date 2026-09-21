import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileSpreadsheet, FileText } from "lucide-react";

import { listarSalidas } from "@/api/salidas";
import { listarFacturas } from "@/api/facturas";
import { listarPagos } from "@/api/pagos";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { exportarExcel, exportarPdf } from "@/lib/exportUtils";

import type { Salida } from "@/types/salida";
import type { Factura } from "@/types/factura";
import type { Pago } from "@/types/pago";
import type { Vehiculo } from "@/types/vehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type InfoVehiculo = { tipoVehiculo: string; categoriaPersona: string; identificador: string };

export default function ReportesPage() {
  const [salidas, setSalidas] = useState<Salida[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const [s, f, p, v, t] = await Promise.all([
          listarSalidas(),
          listarFacturas(),
          listarPagos(),
          listarVehiculos(),
          listarTiposVehiculo(),
        ]);
        setSalidas(s);
        setFacturas(f);
        setPagos(p);
        setVehiculos(v);
        setTipos(t);
      } catch {
        toast.error("No se pudieron cargar los datos para los reportes");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // Mapa placa -> info completa del vehículo (tipo, categoría, e identificador legible:
  // la placa si existe, o "Ficha N°" si es una bicicleta)
  const infoPorPlaca = useMemo(() => {
    const mapa = new Map<string, InfoVehiculo>();
    vehiculos.forEach((v) => {
      const tipo = tipos.find((t) => t.idTipoVehiculo === v.idTipoVehiculo)?.nombre ?? "-";
      const identificador = v.placa ? v.placa : v.numeroFicha ? `Ficha ${v.numeroFicha}` : "-";
      mapa.set(identificador, { tipoVehiculo: tipo, categoriaPersona: v.categoriaPersona, identificador });
    });
    return mapa;
  }, [vehiculos, tipos]);

  const placaPorFactura = useMemo(() => {
    const mapa = new Map<number, string>();
    facturas.forEach((f) => mapa.set(f.idFactura, f.placaVehiculo));
    return mapa;
  }, [facturas]);

  function obtenerInfo(placa: string): InfoVehiculo {
    return infoPorPlaca.get(placa) ?? { tipoVehiculo: "-", categoriaPersona: "-", identificador: placa || "-" };
  }

  if (cargando) return <p className="text-muted-foreground">Cargando reportes...</p>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <Tabs defaultValue="ingresos">
        <TabsList>
          <TabsTrigger value="ingresos">Ingresos y salidas</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos">
          <ReporteIngresosSalidas datos={salidas} obtenerInfo={obtenerInfo} tiposDisponibles={tipos.map((t) => t.nombre)} />
        </TabsContent>

        <TabsContent value="facturacion">
          <ReporteFacturacion datos={facturas} obtenerInfo={obtenerInfo} />
        </TabsContent>

        <TabsContent value="pagos">
          <ReportePagos datos={pagos} placaPorFactura={placaPorFactura} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ================= Reporte 1: Ingresos y Salidas =================

function ReporteIngresosSalidas({
  datos,
  /*obtenerInfo,*/
  tiposDisponibles,
}: {
  datos: Salida[];
  obtenerInfo: (placa: string) => InfoVehiculo;
  tiposDisponibles: string[];
}) {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");

  const filtrados = useMemo(() => {
    return datos
      .filter((s) => {
        const fecha = s.fechaSalida.slice(0, 10);
        if (fechaDesde && fecha < fechaDesde) return false;
        if (fechaHasta && fecha > fechaHasta) return false;
        if (tipoVehiculo && s.tipoVehiculo !== tipoVehiculo) return false;
        return true;
      })
      .sort((a, b) => b.fechaSalida.localeCompare(a.fechaSalida));
  }, [datos, fechaDesde, fechaHasta, tipoVehiculo]);

  function exportarComoExcel() {
    const filas = filtrados.map((s) => ({
      Identificador: s.placaVehiculo,
      "Tipo vehículo": s.tipoVehiculo,
      "Fecha ingreso": s.fechaIngreso,
      "Fecha salida": s.fechaSalida,
      Tarifa: s.nombreTarifa,
      "Valor total": s.valorTotal,
    }));
    exportarExcel(filas, "reporte_ingresos_salidas");
  }

  function exportarComoPdf() {
    const columnas = ["Vehículo", "Tipo", "Ingreso", "Salida", "Valor"];
    const filas = filtrados.map((s) => [
      s.placaVehiculo,
      s.tipoVehiculo,
      s.fechaIngreso.slice(0, 16).replace("T", " "),
      s.fechaSalida.slice(0, 16).replace("T", " "),
      `$${s.valorTotal}`,
    ]);
    exportarPdf("Reporte de Ingresos y Salidas", columnas, filas, "reporte_ingresos_salidas");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>Desde</Label>
          <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <div>
          <Label>Tipo de vehículo</Label>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={tipoVehiculo}
            onChange={(e) => setTipoVehiculo(e.target.value)}
          >
            <option value="">Todos</option>
            {tiposDisponibles.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={exportarComoExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportarComoPdf}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ingreso</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.length === 0 && (
            <TableRow><TableCell colSpan={6}>No hay resultados para estos filtros</TableCell></TableRow>
          )}
          {filtrados.map((s) => (
            <TableRow key={s.idSalida}>
              <TableCell>{s.placaVehiculo}</TableCell>
              <TableCell>{s.tipoVehiculo}</TableCell>
              <TableCell>{s.fechaIngreso.slice(0, 16).replace("T", " ")}</TableCell>
              <TableCell>{s.fechaSalida.slice(0, 16).replace("T", " ")}</TableCell>
              <TableCell>{s.nombreTarifa}</TableCell>
              <TableCell>${s.valorTotal}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ================= Reporte 2: Facturación =================

function ReporteFacturacion({
  datos,
  obtenerInfo,
}: {
  datos: Factura[];
  obtenerInfo: (placa: string) => InfoVehiculo;
}) {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [categoria, setCategoria] = useState("");

  const filtrados = useMemo(() => {
    return datos
      .filter((f) => {
        const fecha = f.fecha.slice(0, 10);
        if (fechaDesde && fecha < fechaDesde) return false;
        if (fechaHasta && fecha > fechaHasta) return false;
        if (categoria && obtenerInfo(f.placaVehiculo).categoriaPersona !== categoria) return false;
        return true;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [datos, fechaDesde, fechaHasta, categoria, obtenerInfo]);

  function exportarComoExcel() {
    const filas = filtrados.map((f) => ({
      Vehículo: obtenerInfo(f.placaVehiculo).identificador,
      Usuario: `${f.nombres} ${f.apellidos}`,
      Fecha: f.fecha,
      Subtotal: f.subtotal,
      Total: f.total,
      Estado: f.estado,
    }));
    exportarExcel(filas, "reporte_facturacion");
  }

  function exportarComoPdf() {
    const columnas = ["Vehículo", "Usuario", "Fecha", "Total", "Estado"];
    const filas = filtrados.map((f) => [
      obtenerInfo(f.placaVehiculo).identificador,
      `${f.nombres} ${f.apellidos}`,
      f.fecha.slice(0, 10),
      `$${f.total}`,
      f.estado,
    ]);
    exportarPdf("Reporte de Facturación", columnas, filas, "reporte_facturacion");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>Desde</Label>
          <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <div>
          <Label>Categoría de persona</Label>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="DOCENTE_ADMINISTRATIVO_EXTERNO">Docente/Admin/Externo</option>
            <option value="CENTRO_OBRERO">Centro Obrero</option>
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={exportarComoExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportarComoPdf}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.length === 0 && (
            <TableRow><TableCell colSpan={5}>No hay resultados para estos filtros</TableCell></TableRow>
          )}
          {filtrados.map((f) => (
            <TableRow key={f.idFactura}>
              <TableCell>{obtenerInfo(f.placaVehiculo).identificador}</TableCell>
              <TableCell>{f.nombres} {f.apellidos}</TableCell>
              <TableCell>{f.fecha.slice(0, 10)}</TableCell>
              <TableCell>${f.total}</TableCell>
              <TableCell>{f.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ================= Reporte 3: Pagos =================

function ReportePagos({
  datos,
  placaPorFactura,
}: {
  datos: Pago[];
  placaPorFactura: Map<number, string>;
}) {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [metodoPago, setMetodoPago] = useState("");

  const metodosDisponibles = useMemo(
    () => Array.from(new Set(datos.map((p) => p.metodoPago))),
    [datos]
  );

  const filtrados = useMemo(() => {
    return datos
      .filter((p) => {
        const fecha = p.fecha.slice(0, 10);
        if (fechaDesde && fecha < fechaDesde) return false;
        if (fechaHasta && fecha > fechaHasta) return false;
        if (metodoPago && p.metodoPago !== metodoPago) return false;
        return true;
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [datos, fechaDesde, fechaHasta, metodoPago]);

  function exportarComoExcel() {
    const filas = filtrados.map((p) => ({
      Vehículo: placaPorFactura.get(p.idFactura) ?? "-",
      Fecha: p.fecha,
      Monto: p.monto,
      "Método de pago": p.metodoPago,
      Estado: p.estado,
    }));
    exportarExcel(filas, "reporte_pagos");
  }

  function exportarComoPdf() {
    const columnas = ["Vehículo", "Fecha", "Monto", "Método", "Estado"];
    const filas = filtrados.map((p) => [
      placaPorFactura.get(p.idFactura) ?? "-",
      p.fecha.slice(0, 10),
      `$${p.monto}`,
      p.metodoPago,
      p.estado,
    ]);
    exportarPdf("Reporte de Pagos", columnas, filas, "reporte_pagos");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>Desde</Label>
          <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div>
          <Label>Hasta</Label>
          <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
        <div>
          <Label>Método de pago</Label>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="">Todos</option>
            {metodosDisponibles.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={exportarComoExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportarComoPdf}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehículo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.length === 0 && (
            <TableRow><TableCell colSpan={5}>No hay resultados para estos filtros</TableCell></TableRow>
          )}
          {filtrados.map((p) => (
            <TableRow key={p.idPago}>
              <TableCell>{placaPorFactura.get(p.idFactura) ?? "-"}</TableCell>
              <TableCell>{p.fecha.slice(0, 10)}</TableCell>
              <TableCell>${p.monto}</TableCell>
              <TableCell>{p.metodoPago}</TableCell>
              <TableCell>{p.estado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}