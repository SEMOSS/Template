import { Fragment } from "react";
import { Link, type UIMatch, useMatches } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbSegment {
	label: string;
	/** Omit for a segment that's never a link (e.g. a group label). The last
	 * segment in the trail is always rendered as the current page regardless. */
	path?: string;
}

export interface RouteHandle {
	/** The breadcrumb segment(s) this route contributes, in order. Almost
	 * always just one - a route only needs more than one when its own URL
	 * flattens what's logically a deeper nesting (see the candidate-matching
	 * route in Router.tsx). */
	crumbs?: (match: UIMatch) => BreadcrumbSegment[];
}

// Segments come straight from each matched route's own handle.crumbs (see
// Router.tsx) - no pathname parsing, no manual registration. Nesting a page
// further just means adding one more route with its own handle.
export const PageBreadcrumbs = () => {
	const matches = useMatches();

	const segments = matches.flatMap((match) => {
		const handle = match.handle as RouteHandle | undefined;
		const crumbs = handle?.crumbs?.(match) ?? [];
		return crumbs.map((segment, index) => ({
			...segment,
			key: `${match.id}-${index}`,
		}));
	});

	if (segments.length === 0) {
		return null;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{segments.map((segment, index) => {
					const isLast = index === segments.length - 1;
					return (
						<Fragment key={segment.key}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>
										{segment.label}
									</BreadcrumbPage>
								) : segment.path ? (
									<BreadcrumbLink asChild>
										<Link to={segment.path}>
											{segment.label}
										</Link>
									</BreadcrumbLink>
								) : (
									segment.label
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
};
