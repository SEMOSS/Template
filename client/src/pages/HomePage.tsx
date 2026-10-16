// HomePage.tsx - The default landing page. Replace this with your own content.

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTE_PATH_NOTES } from "@/routes.constants";

export const HomePage = () => (
	<div className="flex flex-col items-start gap-4">
		<div className="flex flex-col gap-1">
			<h1 className="font-semibold text-xl">Welcome</h1>
			<p className="text-muted-foreground text-sm">
				This is the starting point for your app. Replace this page, then
				delete the notes example once you no longer need it.
			</p>
		</div>
		<Button asChild variant="outline" size="sm">
			<Link to={`/${ROUTE_PATH_NOTES}`}>See the notes example</Link>
		</Button>
	</div>
);
