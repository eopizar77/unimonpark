import fs from 'fs';
let content = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf8');

content = content.replace(
    '<Icono className="h-4 w-4 " + (activo ? "text-blue-700" : "text-slate-400") />',
    '<Icono className={"h-4 w-4 " + (activo ? "text-blue-700" : "text-slate-400")} />'
);

fs.writeFileSync('src/components/layout/AppLayout.tsx', content, 'utf8');
