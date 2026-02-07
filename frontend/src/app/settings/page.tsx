'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>App configuration controls will live here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              App configuration controls will live here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
