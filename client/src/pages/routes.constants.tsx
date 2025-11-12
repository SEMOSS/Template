import { GetStockHistory } from "./GetStockHistory";
import { GetStockPrice } from "./GetStockPrice";
export const ROUTE_PATH_LOGIN_PAGE = "login";

// Page/component mapping for dynamic routing
export const PAGE_TYPES = {
  get_stock_price: <GetStockPrice />,
  get_stock_history: <GetStockHistory />,
  // stock_resource: "stock_resource",
} as const;
