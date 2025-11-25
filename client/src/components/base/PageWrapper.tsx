import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Wrapper component that adds a back button to pages
export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const navigate = useNavigate();

	const handleBackClick = () => {
		navigate("/");
	};

	return (
		<div className="relative h-full w-full">
			<div className="absolute top-4 left-4 z-50">
				<Button
					onClick={handleBackClick}
					variant="outline"
					size="icon"
					className="bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
			</div>
			{children}
		</div>
	);
};
