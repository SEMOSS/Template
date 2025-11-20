import { Stack } from "@mui/material";
import { useInsight } from "@semoss/sdk/react";
import { useState } from "react";
import { SearchComponent, SubmitComponent, TextModal } from "@/components";
import { useAppContext } from "@/contexts";
import type { Engine, SemossFile } from "@/types";

/**
 * Renders the home page, currently displaying an example component.
 *
 * @component
 */
export const HomePage = () => {
	/**
	 * Library hooks
	 */
	const { tool, actions } = useInsight();
	const { runPixel, setMessageSnackbarProps } = useAppContext();

	/**
	 * State
	 */
	const [selectedFileMap, setSelectedFileMap] = useState<
		Record<string, SemossFile>
	>({});
	const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
	const [storageEngine, setStorageEngine] = useState<Engine>(null);
	const [model, setModel] = useState<Engine>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalText, setModalText] = useState<string>("");
	const [isRunningMCP, setIsRunningMCP] = useState<boolean>(false);

	/**
	 * Functions
	 */
	const handleParse = async () => {
		setIsLoadingSubmit(true);
		try {
			const pixelResponse = await runPixel<{ content: string }>(
				`AskStorageDocuments( storage=${JSON.stringify(storageEngine.app_id)}, storagePath=${JSON.stringify(Object.keys(selectedFileMap))}, model=${JSON.stringify(model.app_id)}, filePath="/", space="insight" );`,
			);
			setModalText(pixelResponse.content);
			setIsModalOpen(true);
		} catch (error) {
			setMessageSnackbarProps({
				open: true,
				message: `Error during submission: ${error.message ?? error}`,
				severity: "error",
			});
		} finally {
			setIsLoadingSubmit(false);
		}
	};

	const handleMCP = () => {
		setIsRunningMCP(true);
		try {
			if (tool?.name) {
				actions.sendMCPResponseToPlayground(modalText);
				setMessageSnackbarProps({
					open: true,
					message: "MCP response sent to Playground successfully.",
					severity: "success",
				});
			}
			setIsModalOpen(false);
		} catch (error) {
			setMessageSnackbarProps({
				open: true,
				message: `Error during submission: ${error.message ?? error}`,
				severity: "error",
			});
		} finally {
			setIsRunningMCP(false);
		}
	};

	const handleFileClick = (file: SemossFile) => {
		setSelectedFileMap((prevSelectedFileMap) => {
			const newSelectedFileMap = { ...prevSelectedFileMap };
			if (newSelectedFileMap[file.Path]) {
				delete newSelectedFileMap[file.Path];
			} else {
				newSelectedFileMap[file.Path] = file;
			}
			return newSelectedFileMap;
		});
	};

	return (
		<Stack justifyContent="space-between" alignItems="center" height="100%">
			<SearchComponent
				disabled={isLoadingSubmit}
				selectedFileMap={selectedFileMap}
				onFileClick={handleFileClick}
				clearSelectedFiles={() => setSelectedFileMap({})}
				model={model}
				storageEngine={storageEngine}
				setModel={setModel}
				setStorageEngine={setStorageEngine}
			/>
			<SubmitComponent
				selectedFileMap={selectedFileMap}
				isLoadingSubmit={isLoadingSubmit}
				onSubmit={handleParse}
				disabled={
					!model ||
					!storageEngine ||
					Object.keys(selectedFileMap).length === 0
				}
				onDelete={handleFileClick}
				disabledText={
					Object.keys(selectedFileMap).length === 0
						? "Select at least one file to parse"
						: !model
							? "Select a model to enable parsing"
							: ""
				}
			/>
			<TextModal
				open={isModalOpen}
				onExit={async (submit) => {
					if (submit) {
						handleMCP();
					} else {
						setIsModalOpen(false);
					}
				}}
				text={modalText}
				loading={isRunningMCP}
			/>
		</Stack>
	);
};
