import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  badge?: {
    text: string;
    variant: "default" | "secondary" | "outline" | "success" | "planned" | "warning";
  };
  description: string;
  points: string[];
  ctaText?: string;
  ctaHref?: string;
  className?: string;
  highlighted?: boolean;
}

export function FeatureCard({
  icon,
  title,
  badge,
  description,
  points,
  ctaText,
  ctaHref,
  className,
  highlighted = false,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        highlighted && "border-indigo-400/80 shadow-indigo-500/10 dark:border-indigo-600",
        className
      )}
    >
      {highlighted && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
      )}

      <div>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shadow-sm">
              {icon}
            </div>
            {badge && (
              <Badge variant={badge.variant}>
                {badge.text}
              </Badge>
            )}
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-2.5">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      {ctaText && ctaHref && (
        <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link href={ctaHref} className="w-full">
            <Button variant="ghost" className="w-full justify-between group p-0 h-auto hover:bg-transparent text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
