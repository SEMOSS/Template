import {
	Autocomplete,
	Grid,
	Stack,
	styled,
	TextField,
	Typography,
} from "@mui/material";
import { useDebouncedValue, useInsight } from "@semoss/sdk/react";
import { useMemo, useState } from "react";
import { useAppContext } from "@/contexts";
import { useLoadingPixel } from "@/hooks";
import type { Engine, SemossFile } from "@/types";
import { FileCard } from "./FileCard";

export interface SearchComponentProps {
	selectedFileMap: Record<string, SemossFile>;
	onFileClick: (file: SemossFile) => void;
	disabled: boolean;
	clearSelectedFiles: () => void;
	model: Engine;
	storageEngine: Engine;
	setModel: (model: Engine) => void;
	setStorageEngine: (engine: Engine) => void;
}

const GrayStack = styled(Stack)(({ theme }) => ({
	backgroundColor: theme.palette.grey[200],
}));

/**
 * A component that allows users to search through the vault
 *
 * @component
 */
export const SearchComponent = ({
	disabled,
	selectedFileMap,
	onFileClick,
	clearSelectedFiles,
	model,
	storageEngine,
	setModel,
	setStorageEngine,
}: SearchComponentProps) => {
	/**
	 * Library hooks
	 */
	const { tool } = useInsight();
	const { models, storageEngines } = useAppContext();

	/**
	 * State
	 */
	const [searchQuery, setSearchQuery] = useState<string>(
		(tool?.parameters?.command as string) || "",
	);

	/**
	 * Library hooks
	 */
	const debouncedSearch = useDebouncedValue(searchQuery, 750);
	const [allFiles, isLoadingAllFiles] = useLoadingPixel<SemossFile[]>(
		`ListStoragePathDetails(storage = ${JSON.stringify(storageEngine?.app_id)}, storagePath="/" );`,
		[],
		!storageEngine,
	);
	const [searchedFilePaths, isLoadingSearch] = useLoadingPixel<string[]>(
		`GetRelevantStorageDocuments(command=${JSON.stringify(debouncedSearch)}, storage=${JSON.stringify(storageEngine?.app_id)}, model=${JSON.stringify(model?.app_id)}, storagePath="/")`,
		[],
		!(debouncedSearch && model && storageEngine),
	);

	/**
	 * Memos
	 */
	const allFileMap = useMemo(
		() =>
			allFiles.reduce(
				(acc, curr) => {
					acc[curr.Path] = curr;
					return acc;
				},
				{} as Record<string, SemossFile>,
			),
		[allFiles],
	);

	/**
	 * Constants
	 */
	const displayedFiles = debouncedSearch
		? Array.from(
				new Set([
					...searchedFilePaths,
					...allFiles
						.filter((file) =>
							file.Name.toLowerCase().includes(
								debouncedSearch.toLowerCase(),
							),
						)
						.map((file) => file.Path),
				]),
			).map((path) => allFileMap[path])
		: allFiles;

	return (
		<>
			<GrayStack padding={2} width="100%" alignItems="center" spacing={2}>
				<Typography variant="h5" fontWeight="bold">
					Document Vault
				</Typography>
				<TextField
					multiline
					rows={3}
					fullWidth
					placeholder="What information are you looking for?"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					disabled={disabled}
				/>
				<Stack
					direction="row"
					spacing={2}
					justifyContent="space-between"
					width="100%"
				>
					<Autocomplete
						options={storageEngines}
						getOptionKey={(engine) => engine.app_id}
						getOptionLabel={(engine) => engine.app_name}
						value={storageEngine}
						onChange={(_e, val) => {
							setStorageEngine(val);
							clearSelectedFiles();
						}}
						renderInput={(params) => (
							<TextField {...params} label="Storage engine" />
						)}
						fullWidth
						disabled={disabled}
					/>
					<Autocomplete
						options={models}
						getOptionKey={(model) => model.app_id}
						getOptionLabel={(model) => model.app_name}
						value={model}
						onChange={(_e, val) => setModel(val)}
						renderInput={(params) => (
							<TextField {...params} label="Model" />
						)}
						fullWidth
						disabled={disabled}
					/>
				</Stack>
			</GrayStack>
			<Stack
				height="100%"
				width="100%"
				padding={2}
				overflow="auto"
				spacing={2}
			>
				<Typography fontStyle="italic">
					{isLoadingAllFiles ||
					isLoadingSearch ||
					debouncedSearch !== searchQuery
						? "Loading files..."
						: `${
								!storageEngine
									? "Select a storage engine to get started."
									: !displayedFiles.length
										? "No files found."
										: `${displayedFiles.length} file${displayedFiles.length !== 1 ? "s" : ""} found.`
							}${!model ? " Select a model to enable smart search." : ""}`}
				</Typography>
				<Grid container spacing={2} overflow="auto">
					{displayedFiles.map((file) => (
						<Grid key={file.Path}>
							<FileCard
								file={file}
								selected={Boolean(selectedFileMap[file.Path])}
								onClick={() => onFileClick(file)}
								disabled={disabled}
							/>
						</Grid>
					))}
				</Grid>
			</Stack>
		</>
	);
};
