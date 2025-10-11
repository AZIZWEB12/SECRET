'use client';

import { QuizDifficulty, QuizQuestionData, UserSegment } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { Badge } from "../ui/badge";

interface ReviewQuizProps {
    quizData: {
        title: string;
        segment: UserSegment;
        difficulty: QuizDifficulty;
        premiumOnly: boolean;
        questions: QuizQuestionData[];
    };
    onSave: () => void;
    onCancel: () => void;
    onBack: () => void;
}

export function ReviewQuiz({ quizData, onSave, onCancel, onBack }: ReviewQuizProps) {
    return (
        <>
            <div className="flex flex-wrap gap-4 items-center mb-4 text-sm">
                <Badge variant="outline">Segment: {quizData.segment}</Badge>
                <Badge variant="outline">Difficulté: {quizData.difficulty}</Badge>
                <Badge variant={quizData.premiumOnly ? "default" : "secondary"}>
                    Accès: {quizData.premiumOnly ? "Premium" : "Gratuit"}
                </Badge>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-4">
                {quizData.questions.map((q, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                            <CardDescription>{q.question}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-2 text-sm">
                                {q.options.map(opt => (
                                    <li key={opt.label} className={`p-2 rounded-md ${opt.is_correct ? 'bg-green-100 dark:bg-green-900/50' : 'bg-muted/50'}`}>
                                        <strong>{opt.label}:</strong> {opt.text}
                                    </li>
                                ))}
                            </ul>
                            {q.explanation && (
                                <p className="mt-4 text-xs text-muted-foreground italic">
                                    <strong>Explication :</strong> {q.explanation}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onCancel}>Annuler</Button>
                    <Button onClick={onSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Confirmer et Sauvegarder
                    </Button>
                </div>
            </div>
        </>
    );
}
