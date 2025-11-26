import { X } from "lucide-react";
import { useState } from "react";
import { DatePicker } from "@/components";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/contexts";
import { useLoadingState } from "@/hooks";

export interface AddAnimalModalProps {
	open: boolean;
	onClose: (addedAnimal: boolean) => void;
}

/**
 * Renders a modal to add an animal.
 *
 * @component
 */
export const AddAnimalModal = ({ open, onClose }: AddAnimalModalProps) => {
	/**
	 * Library hooks
	 */
	const [isLoadingAdd, setIsLoadingAdd] = useLoadingState(false);
	const { runPixel } = useAppContext();

	/**
	 * State
	 */
	const [animalName, setAnimalName] = useState<string>("");
	const [animalType, setAnimalType] = useState<string>("");
	const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);

	/**
	 * Functions
	 */
	const handleSubmitClick = async () => {
		const loadingKey = setIsLoadingAdd(true);
		try {
			await runPixel(
				`AddAnimal(animalName=${JSON.stringify(animalName)}, animalType=${JSON.stringify(animalType)}, dateOfBirth=${JSON.stringify(dateOfBirth)})`,
				"Successfully added animal!",
			);
			handleClose(true);
		} catch {
			// Error handled in runPixel
		}
		setIsLoadingAdd(false, loadingKey);
	};

	const handleClose = (madeChanges?: boolean) => {
		setAnimalName("");
		setAnimalType("");
		setDateOfBirth(null);
		onClose(madeChanges ?? false);
	};

	/**
	 * Constants
	 */
	const isReadyToSubmit =
		animalName.trim().length > 0 &&
		animalType.trim().length > 0 &&
		dateOfBirth !== null;

	return (
		<Dialog open={open} onOpenChange={() => handleClose(false)}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Animal</DialogTitle>
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-4 top-4"
						onClick={() => handleClose(false)}
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</Button>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={animalName}
							onChange={(e) => setAnimalName(e.target.value)}
							placeholder="Enter animal name"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="type">Type</Label>
						<Input
							id="type"
							value={animalType}
							onChange={(e) => setAnimalType(e.target.value)}
							placeholder="Enter animal type"
						/>
					</div>

					<div className="space-y-2">
						<Label>Date of birth</Label>
						<DatePicker
							value={dateOfBirth}
							onChange={(newValue) => setDateOfBirth(newValue)}
							label="Date of birth"
							maxDate={new Date()} // Prevent future dates
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						onClick={handleSubmitClick}
						disabled={!isReadyToSubmit || isLoadingAdd}
					>
						{isLoadingAdd ? "Adding..." : "Add animal"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
