import { Music2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-primary/10 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-headline text-primary tracking-tight">
            Sur Sangam
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
