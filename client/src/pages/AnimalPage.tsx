import { useCallback, useEffect, useState } from "react";
import {
	AddAnimalModal,
	type Animal,
	AnimalList,
	DeleteAnimalModal,
} from "@/components";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { useLoadingState } from "@/hooks";

/**
 * Renders a page for the animal example.
 *
 * @component
 */
export const AnimalPage = () => {
	/**
	 * Library hooks
	 */
	const { runPixel } = useAppContext();

	/**
	 * State
	 */
	const [animalList, setAnimalList] = useState<Animal[]>([]);
	const [isAnimalListLoading, setIsAnimalListLoading] =
		useLoadingState(false);
	const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] =
		useState<boolean>(false);
	const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] =
		useState<boolean>(false);
	const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

	/**
	 * Functions
	 */
	const fetchAnimalList = useCallback(async () => {
		const loadingKey = setIsAnimalListLoading(true);
		try {
			const animals = await runPixel<Animal[]>("GetAnimalList()");
			setIsAnimalListLoading(false, loadingKey, () => {
				setAnimalList(animals);
			});
		} catch {
			// Error handled in runPixel
			setIsAnimalListLoading(false, loadingKey, () => {
				setAnimalList([]);
			});
		}
	}, [runPixel, setIsAnimalListLoading]);

	const handleModalClose = (changedAnimals: boolean) => {
		setIsAddAnimalModalOpen(false);
		setIsDeleteAnimalModalOpen(false);
		if (changedAnimals) {
			fetchAnimalList();
		}
	};

	/**
	 * Effects
	 */
	useEffect(() => {
		fetchAnimalList();
	}, [fetchAnimalList]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-4xl font-bold">Animals</h1>
				<Button onClick={() => setIsAddAnimalModalOpen(true)}>
					Add animal
				</Button>
			</div>

			<AnimalList
				animalList={animalList ?? []}
				loading={isAnimalListLoading}
				onDelete={(animalToDelete) => {
					setIsDeleteAnimalModalOpen(true);
					setAnimalToDelete(animalToDelete);
				}}
			/>

			<AddAnimalModal
				open={isAddAnimalModalOpen}
				onClose={handleModalClose}
			/>

			<DeleteAnimalModal
				open={isDeleteAnimalModalOpen}
				animalToDelete={animalToDelete}
				onClose={handleModalClose}
			/>
		</div>
	);
};
