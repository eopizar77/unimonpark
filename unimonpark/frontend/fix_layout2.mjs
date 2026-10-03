import fs from 'fs';
let content = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf8');

// Remove unused imports
content = content.replace('import { Separator } from "@/components/ui/separator";\n', '');
content = content.replace('import { Avatar, AvatarFallback, AvatarImage }', 'import { Avatar, AvatarFallback }');
content = content.replace(', Menu, Bell, Search, PanelLeft', ', Bell, PanelLeft');

// Remove asChild and wrap Button
content = content.replace(
    '<SheetTrigger asChild>',
    '<SheetTrigger>'
);

fs.writeFileSync('src/components/layout/AppLayout.tsx', content, 'utf8');
