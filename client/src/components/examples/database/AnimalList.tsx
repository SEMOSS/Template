import { IconButton } from "@mui/material";
import { DataGrid, GridDeleteIcon } from "@mui/x-data-grid";
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
	return (
		<DataGrid
			loading={loading}
			columns={[
				{ field: "animal_id", headerName: "ID", type: "string" },
				{ field: "animal_name", headerName: "Name", type: "string" },
				{ field: "animal_type", headerName: "Type", type: "string" },
				{
					field: "date_of_birth",
					headerName: "Date of birth",
					type: "date",
					valueGetter: (value) => (value ? new Date(value) : null),
				},
				{
					field: "actions",
					headerName: "Actions",
					type: "actions",
					align: "right",
					getActions: (rowParams) => [
						<IconButton
							onClick={() => onDelete(rowParams.row)}
							key="delete"
						>
							<GridDeleteIcon />
						</IconButton>,
					],
				},
			]}
			rows={animalList}
			getRowId={(row) => row.animal_id}
		/>
	);
};
