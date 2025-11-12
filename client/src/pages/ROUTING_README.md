# Parameterized Routing System

This document explains how to use the updated routing system that supports different pages based on route parameters.

## Route Configuration

The routing system is configured in `Router.tsx` using React Router's `createHashRouter`. The routes are organized as follows:

1. **InitializedLayout** - Wraps all routes to ensure SEMOSS is ready
2. **AuthorizedLayout** - Wraps protected routes that require authentication
3. **Public Routes** - Login page and error handling

### Adding New Routes

To add a new parameterized route:

1. Add the route configuration to the router in `Router.tsx`
2. Add any new page types to `PAGE_TYPES` in `routes.constants.tsx`

### Adding New Pages

To add a new page component:

1. Create the page component in the `pages/` directory
2. Export it from `pages/index.ts`
3. Add it to the appropriate route mapping to `PAGE_TYPES` in `routes.constants.tsx`
