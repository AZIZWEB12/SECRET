'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function QuizPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Quiz</h1>
        <p className="text-muted-foreground">
          Testez vos connaissances avec notre collection de quiz.
        </p>
      </div>

      <div className="mt-8">
        <Card className="flex h-64 w-full flex-col items-center justify-center text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Bientôt disponible</CardTitle>
                <CardDescription>
                    La section des quiz est en cours de construction. Revenez bientôt !
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    </AppLayout>
  );
}
