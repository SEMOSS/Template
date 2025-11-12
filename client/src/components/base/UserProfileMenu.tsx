import { useAppContext } from "@/contexts";
import { useLoadingState } from "@/hooks";



/**
 * Renders a menu showing users their name and allowing them to log out
 *
 * @component
 */
export const UserProfileMenu = () => {
	const { logout, userLoginName } = useAppContext();

	/**
	 * State
	 */
	const [, setIsLogoutLoading] = useLoadingState();

	/**
	 * Functions
	 */
	const handleLogout = async () => {
		const loadingKey = setIsLogoutLoading(true);
		const success = await logout();
		if (success) localStorage.clear();
		window.location.reload();
		setIsLogoutLoading(false, loadingKey);
	};

	return (
		<div className="flex flex-col gap-2 p-4 min-w-[180px] rounded-xl shadow">
			<div className="flex flex-col items-start mb-2">
				<span className="font-semibold text-sky-900 text-base truncate max-w-[140px]">{userLoginName}</span>
			</div>
			<button
				type="button"
				title="Logout"
				onClick={handleLogout}
				className="w-full mt-1 px-3 py-2 rounded-md bg-sky-50 text-sky-800 hover:bg-sky-100 hover:text-sky-900 font-medium transition-colors text-left"
			>
				Logout
			</button>
		</div>
	);
};
