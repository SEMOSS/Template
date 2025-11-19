import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/contexts";

export const HomePage = () => {
	const { tools } = useAppContext();
	// Function to format page names for display
	const formatPageName = (pageName: string) => {
		return pageName
			.replace(/_/g, " ") // Replace underscores with spaces
			.split(" ")
			.map(
				(word) =>
					word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
			) // Capitalize first letter of each word
			.join(" ");
	};

	return (
		<div className="flex flex-col items-center justify-center relative h-full w-full overflow-hidden">
			<Card className="w-full h-full">
				<CardContent className="p-6">
					<div className="flex flex-col gap-4">
						{tools.map((tool) => {
							const name = tool?.name || "";
							return (
								<Button
									key={name}
									variant="outline"
									size="lg"
									className="w-full"
									onClick={() => {
										window.location.hash = `#/${name}`;
									}}
								>
									{formatPageName(name)}
								</Button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
