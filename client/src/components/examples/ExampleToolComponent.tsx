import { useInsight } from "@semoss/sdk/react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

const FRUITS = [
	"Apple",
	"Banana",
	"Orange",
	"Strawberry",
	"Grape",
	"Mango",
	"Blueberry",
	"Raspberry",
	"Pineapple",
	"Watermelon",
	"Kiwi",
	"Peach",
];

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
	const { tool } = useInsight();

	/**
	 * State
	 */
	const [likedFruits, setLikedFruits] = useState<Set<string>>(new Set());
	const [recipe, setRecipe] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	/**
	 * Methods
	 */
	/**
	 * Toggles a fruit in the liked fruits set
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

	/**
	 * Submits the selected fruits to generate a smoothie recipe
	 */
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
				{ fruitList: Array.from(likedFruits) },
			);
		}

		setIsSubmitting(false);
	};

	/**
	 * Resets the form to its initial state
	 */
	const handleReset = () => {
		setLikedFruits(new Set());
		setRecipe("");
	};

	/**
	 * Effects
	 */
	// Load data from tool call - populates form when component is initialized via MCP tool
	useEffect(() => {
		// Helper to validate and set fruits from external tool calls
		const validateAndSetFruits = (fruits: unknown): void => {
			if (fruits && Array.isArray(fruits)) {
				const validFruits = fruits.filter((fruit) =>
					FRUITS.includes(fruit),
				);
				setLikedFruits(new Set(validFruits));
			}
		};

		if (tool?.original_name === "FruitSmoothie") {
			const initialFruits = tool.parameters?.fruitList;
			validateAndSetFruits(initialFruits);

			const response = tool.tool_response as string;
			if (response) {
				setRecipe(response);
				const finalFruits = tool.executedParameters?.fruitList;
				validateAndSetFruits(finalFruits);
			}
		}
	}, [tool]);

	return (
		<div className="max-w-md space-y-2">
			<h2 className="text-2xl font-bold">
				Fruit Smoothie Recipe Generator
			</h2>
			{!recipe && (
				<>
					{/* Fruit selection checkboxes */}
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
			{/* Preview of selected fruits */}
			{likedFruits.size > 0 && (
				<div className="p-4 bg-gray-100 rounded">
					<p className="font-semibold">You like:</p>
					<p>{Array.from(likedFruits).join(", ")}</p>
				</div>
			)}
			{/* Generated recipe display */}
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
