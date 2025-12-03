import { GetStockHistory } from "./components/mcp/GetStockHistory";
import { GetStockPrice } from "./components/mcp/GetStockPrice";

export const ROUTE_PATH_LOGIN_PAGE = "login";

/**
 * Page/component mapping. Keys much match tool name to render correctly, otherwise uses a default json view
 *
 */
export const PAGE_TYPES = {
	get_stock_price: <GetStockPrice />,
	get_stock_history: <GetStockHistory />,
	// stock_resource: "stock_resource", //
} as const;
