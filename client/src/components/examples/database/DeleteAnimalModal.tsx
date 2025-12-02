import { ConfirmationDialog } from "@/components";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts";
import { useLoadingState } from "@/hooks";
import type { Animal } from "./animal.types";

export interface DeleteAnimalModalProps {
	open: boolean;
	animalToDelete: Animal | null;
	onClose: (changedAnimals: boolean) => void;
}

/**
 * Modal that allows animal deletion
 *
 * @component
 */
export const DeleteAnimalModal = ({
	animalToDelete,
	onClose,
	open,
}: DeleteAnimalModalProps) => {
	/**
	 * Library hooks
	 */
	const { runPixel } = useAppContext();
	const [isLoadingDelete, setIsLoadingDelete] = useLoadingState(false);

	/**
	 * Functions
	 */
	const handleSubmitClick = async () => {
		const loadingKey = setIsLoadingDelete(true);
		try {
			await runPixel(
				`DeleteAnimal(${JSON.stringify(animalToDelete.animal_id)})`,
				"Successfully deleted animal!",
			);
			onClose(true);
		} catch {
			// Error handled in runPixel
		}
		setIsLoadingDelete(false, loadingKey);
	};

	return (
		<ConfirmationDialog
			title={`Delete ${animalToDelete?.animal_name}?`}
			text={`This action will permanently delete ${animalToDelete?.animal_name} from the system.`}
			open={open}
			buttons={
				<>
					<Button variant="default" onClick={() => onClose(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleSubmitClick}
						disabled={isLoadingDelete}
					>
						{isLoadingDelete
							? "Deleting..."
							: `Delete ${animalToDelete?.animal_name}`}
					</Button>
				</>
			}
		/>
	);
};
