import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  titulo: string;
  valor: number | string;
  icon: React.ElementType;
  descripcion?: string;
}

export default function StatCard({ titulo, valor, icon: Icono, descripcion }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icono className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{valor}</div>
        {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
      </CardContent>
    </Card>
  );
}