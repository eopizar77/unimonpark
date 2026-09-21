import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface BuscadorConFiltroProps<T> {
    items: T[];
    valorSeleccionado: number | null;
    obtenerId: (item: T) => number;
    obtenerEtiqueta: (item: T) => string;
    onSeleccionar: (id: number) => void;
    placeholder?: string;
}

export function BuscadorConFiltro<T>({
    items,
    valorSeleccionado,
    obtenerId,
    obtenerEtiqueta,
    onSeleccionar,
    placeholder,
}: BuscadorConFiltroProps<T>) {
    const [texto, setTexto] = useState("");
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef<HTMLDivElement>(null);

    const itemSeleccionado = items.find((item) => obtenerId(item) === valorSeleccionado);

    // Sincroniza el texto visible con el item seleccionado externamente (ej. al editar).
    useEffect(() => {
        if (itemSeleccionado) {
            setTexto(obtenerEtiqueta(itemSeleccionado));
        } else if (valorSeleccionado === null) {
            setTexto("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valorSeleccionado]);

    useEffect(() => {
        function manejarClickFuera(event: MouseEvent) {
            if (contenedorRef.current && !contenedorRef.current.contains(event.target as Node)) {
                setAbierto(false);
            }
        }
        document.addEventListener("mousedown", manejarClickFuera);
        return () => document.removeEventListener("mousedown", manejarClickFuera);
    }, []);

    const coincidencias = texto.trim() === ""
        ? items
        : items.filter((item) => obtenerEtiqueta(item).toLowerCase().includes(texto.toLowerCase()));

    return (
        <div className="relative" ref={contenedorRef}>
            <Input
                value={texto}
                placeholder={placeholder}
                onChange={(event) => {
                    setTexto(event.target.value);
                    setAbierto(true);
                }}
                onFocus={() => setAbierto(true)}
                autoComplete="off"
            />
            {abierto && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover shadow-md">
                    {coincidencias.length === 0 && (
                        <div className="px-2.5 py-2 text-sm text-muted-foreground">Sin resultados</div>
                    )}
                    {coincidencias.map((item) => (
                        <button
                            type="button"
                            key={obtenerId(item)}
                            className="block w-full px-2.5 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => {
                                onSeleccionar(obtenerId(item));
                                setTexto(obtenerEtiqueta(item));
                                setAbierto(false);
                            }}
                        >
                            {obtenerEtiqueta(item)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}