import { MealEntry } from "@/types/meal";
import { MealCard } from "./MealCard";
import { Utensils } from "lucide-react";

type Props = { meals: MealEntry[]; onEdit: (meal: MealEntry) => void; onDelete: (meal: MealEntry) => void; onPreview: (src: string) => void };

export function MealList({ meals, onEdit, onDelete, onPreview }: Props) {
  if (!meals.length) return <div className="border-y border-black/10 px-6 py-12 text-center"><Utensils className="mx-auto text-black/20" strokeWidth={1.5} /><p className="mt-4 font-medium">No meals logged yet</p><p className="mt-1 text-sm text-black/45">Take a photo to add your first meal today.</p></div>;
  return <div className="space-y-3">{meals.map((meal) => <MealCard key={meal.id} meal={meal} onEdit={() => onEdit(meal)} onDelete={() => onDelete(meal)} onPreview={() => onPreview(meal.imageDataUrl)} />)}</div>;
}
