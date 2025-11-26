import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Animal } from "./animal.types";

export interface AnimalListProps {
	animalList: Animal[];
	loading?: boolean;
	onDelete: (animalToDelete: Animal) => void;
}

/**
 * Display a list of animals.
 *
 * @component
 */
export const AnimalList = ({
	animalList,
	loading,
	onDelete,
}: AnimalListProps) => {
	const formatDate = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(`${dateString}T00:00:00`);
		return date.toLocaleDateString();
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">Loading animals...</p>
			</div>
		);
	}

	if (animalList.length === 0) {
		return (
			<div className="flex items-center justify-center py-8">
				<p className="text-muted-foreground">No animals found.</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Date of Birth</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{animalList.map((animal) => (
						<TableRow key={animal.animal_id}>
							<TableCell>{animal.animal_id}</TableCell>
							<TableCell>{animal.animal_name}</TableCell>
							<TableCell>{animal.animal_type}</TableCell>
							<TableCell>
								{formatDate(animal.date_of_birth)}
							</TableCell>
							<TableCell className="text-right">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(animal)}
									aria-label={`Delete ${animal.animal_name}`}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
