import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[18rem] sm:auto-rows-[20rem] lg:auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <Link
    href={href}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-xl",
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "transform-gpu transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
      "cursor-pointer touch-manipulation",
      className,
    )}
  >
    {background && <div>{background}</div>}
    <div className="z-10 flex transform-gpu flex-col gap-1 p-4 sm:p-6 transition-all duration-300">
      <Icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out" />
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-700">
        {name}
      </h3>
      <p className="max-w-lg text-neutral-400 text-xs sm:text-sm">{description}</p>
    </div>

    <div className="flex flex-row items-center p-3 sm:p-4 mt-auto">
      <div className="flex items-center text-xs sm:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        <span>{cta}</span>
        <ArrowRight className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
      </div>
    </div>
    <div className="absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03]" />
  </Link>
);

export { BentoCard, BentoGrid };

