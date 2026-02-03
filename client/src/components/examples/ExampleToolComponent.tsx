import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const FRUITS = ["Apple", "Banana", "Orange", "Strawberry", "Grape", "Mango"];

/**
 * Renders a fruit preference survey form with checkboxes.
 *
 * @component
 */
export const ExampleToolComponent = () => {
	/**
	 * Library hooks
	 */
	const { sendMCPResponseToPlayground, runPixel } = useAppContext();

	/**
	 * State
	 */
	const [likedFruits, setLikedFruits] = useState<Set<string>>(new Set());
	const [recipe, setRecipe] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Handlers
	 */
	const handleCheckboxChange = (fruit: string) => {
		setLikedFruits((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(fruit)) {
				newSet.delete(fruit);
			} else {
				newSet.add(fruit);
			}
			return newSet;
		});
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			const fruitList = Array.from(likedFruits);
			const response = await runPixel<string>(
				`FruitSmoothie(fruitList=${JSON.stringify(fruitList)})`,
			);
			setRecipe(response);
			sendMCPResponseToPlayground("FruitSmoothie", response, "success", {
				fruitList: fruitList,
			});
		} catch {
			sendMCPResponseToPlayground(
				"FruitSmoothie",
				"Error generating smoothie recipe.",
				"error",
			);
		}

		setIsSubmitting(false);
	};

	const handleReset = () => {
		setLikedFruits(new Set());
		setRecipe("");
	};

	return (
		<div className="max-w-md space-y-2">
			<h2 className="text-2xl font-bold">
				{recipe ? "Recipe" : "Fruit Preference Survey"}
			</h2>
			{!recipe && (
				<>
					<div className="space-y-3">
						{FRUITS.map((fruit) => (
							<div
								key={fruit}
								className="flex items-center space-x-3"
							>
								<Checkbox
									id={fruit}
									checked={likedFruits.has(fruit)}
									onCheckedChange={() =>
										handleCheckboxChange(fruit)
									}
									disabled={isSubmitting}
								/>
								<Label
									htmlFor={fruit}
									className="text-lg cursor-pointer"
								>
									{fruit}
								</Label>
							</div>
						))}
					</div>
					<Button
						onClick={handleSubmit}
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Generating Recipe..." : "Submit"}
					</Button>
				</>
			)}
			{likedFruits.size > 0 && (
				<div className="p-4 bg-gray-100 rounded">
					<p className="font-semibold">You like:</p>
					<p>{Array.from(likedFruits).join(", ")}</p>
				</div>
			)}
			{recipe && (
				<div className="p-4 bg-green-100 rounded">
					<pre className="whitespace-pre-wrap">{recipe}</pre>
				</div>
			)}
			<Button
				onClick={handleReset}
				variant="outline"
				className="w-full"
				disabled={isSubmitting}
			>
				Reset
			</Button>
		</div>
	);
};
