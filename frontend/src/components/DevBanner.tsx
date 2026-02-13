import { TriangleAlert } from 'lucide-react';

export function DevBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
      <div className="container-main mx-auto flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
        <TriangleAlert className="size-4 shrink-0" />
        <span>
          <strong>Dev mode</strong> — This page is for internal testing and
          troubleshooting only. It is not part of the production experience.
        </span>
      </div>
    </div>
  );
}
